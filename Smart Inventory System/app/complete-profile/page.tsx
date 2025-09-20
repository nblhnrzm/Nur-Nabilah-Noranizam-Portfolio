"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/utils";
import { useRouter } from 'next/navigation';

interface ProfileData {
  username: string;
  password: string;
  confirmPassword: string;
  display_name: string;
}

const CompleteProfileForm: React.FC = () => {
  // Error component helper
  const ErrorMessage: React.FC<{ error?: string; id: string }> = ({ error, id }) => {
    if (!error) return null;
    return (
      <span 
        id={id} 
        className="text-red-500 text-xs" 
        role="alert" 
        aria-live="polite"
      >
        {error}
      </span>
    );
  };

  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    password: '',
    confirmPassword: '',
    display_name: ''
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    display_name?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [userInfo, setUserInfo] = useState<any>(null);

  const router = useRouter();

  // Get user info from Google OAuth
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserInfo(user);
        // Pre-fill display name with Google name if available
        if (user.user_metadata?.full_name) {
          setFormData(prev => ({
            ...prev,
            display_name: user.user_metadata.full_name
          }));
        }
      } else {
        // Redirect to sign in if no user
        router.push('/sign-in');
      }
    };
    getUserInfo();
  }, [router]);

  // Check username uniqueness
  const checkUsernameUnique = async (username: string) => {
    if (!validateUsername(username)) return;
    setIsCheckingUsername(true);
    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setUsernameExists(data.exists);
      
      if (data.exists) {
        setUsernameSuggestions(data.suggestions || []);
        setErrors(prev => ({ ...prev, username: "Username is already taken. Try one of the suggestions below:" }));
      } else {
        setUsernameSuggestions([]);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.username;
          return newErrors;
        });
      }
    } catch (error) {
      setUsernameSuggestions([]);
      setErrors(prev => ({ ...prev, username: "Couldn't verify username right now." }));
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Username live check
    if (name === 'username') {
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.username;
        return newErrors;
      });
      setUsernameExists(false);
      setUsernameSuggestions([]);
      if (value.length >= 3 && value.length <= 30 && /^[a-zA-Z0-9_.\-@#$%&*+!?]+$/.test(value)) {
        const timeout = setTimeout(() => {
          checkUsernameUnique(value);
        }, 500);
        setUsernameCheckTimeout(timeout);
      }
    }

    // Password strength
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));

    // Confirm password
    if (name === 'password' || name === 'confirmPassword') {
      const pw = name === 'password' ? value : formData.password;
      const cpw = name === 'confirmPassword' ? value : formData.confirmPassword;
      if (cpw && pw !== cpw) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  // Validators
  const validateUsername = (username: string) =>
    username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_.\-@#$%&*+!?]+$/.test(username);

  const validatePassword = (password: string) =>
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const validatePasswordsMatch = (password: string, confirmPassword: string) =>
    password === confirmPassword;

  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Blur handlers
  const handleUsernameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const username = e.target.value;
    if (validateUsername(username)) checkUsernameUnique(username);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (usernameExists) return;

    const newErrors: {
      username?: string;
      password?: string;
      confirmPassword?: string;
      display_name?: string;
    } = {};

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 3 characters and contain only letters, numbers, and symbols.';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and include lowercase, uppercase, digit, and symbol.';
    }
    if (!validatePasswordsMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Update user password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (passwordError) {
        setErrors({ password: passwordError.message });
        setIsLoading(false);
        return;
      }

      // Create user profile
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          username: formData.username,
          email: userInfo.email,
          fullName: userInfo.user_metadata?.full_name || null,
          displayName: formData.display_name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error && result.error.includes("violates unique constraint")) {
          if (result.error.includes("app_user_username_key")) {
            setErrors({ username: "This username is already taken" });
          } else {
            setErrors({ username: result.error || "Failed to create user profile" });
          }
        } else {
          setErrors({ username: result.error || "Failed to create user profile" });
        }
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard or home
      router.push('/');
    } catch (error) {
      setErrors({ username: "Unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Password toggle handlers
  const togglePasswordVisibility = useCallback(() => setShowPassword(!showPassword), [showPassword]);
  const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword(!showConfirmPassword), [showConfirmPassword]);

  // Keyboard navigation for username suggestions
  const handleUsernameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (usernameSuggestions.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion(prev => Math.min(prev + 1, usernameSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(usernameSuggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setUsernameSuggestions([]);
      setActiveSuggestion(-1);
    }
  }, [usernameSuggestions, activeSuggestion]);

  // Handle username suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setFormData(prev => ({ ...prev, username: suggestion }));
    setUsernameSuggestions([]);
    setUsernameExists(false);
    setActiveSuggestion(-1);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.username;
      return newErrors;
    });
    checkUsernameUnique(suggestion);
  }, []);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Welcome {userInfo.user_metadata?.full_name || userInfo.email}! Please complete your profile to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
                Username <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(3-30 characters, letters, numbers, and symbols allowed)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleUsernameBlur}
                  onKeyDown={handleUsernameKeyDown}
                  placeholder="e.g. john_doe, user@123, mike.smith"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300 pr-8"
                  required
                  autoComplete="off"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  style={{ fontSize: '1rem' }}
                />
                {isCheckingUsername && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {!isCheckingUsername && formData.username.length > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {(usernameExists ||
                    (errors.username && errors.username.toLowerCase().includes('taken'))
                    ) ? (
                      <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      validateUsername(formData.username) && (
                        <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )
                    )}
                  </div>
                )}
              </div>
              {errors.username && <ErrorMessage error={errors.username} id="username-error" />}
              {/* Username Suggestions */}
              {usernameSuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm text-gray-600 mb-2">Try one of these available usernames:</p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors cursor-pointer border-none ${
                          activeSuggestion === idx ? "ring-2 ring-indigo-500" : ""
                        }`}
                        type="button"
                        tabIndex={0}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300 pr-12"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  style={{ fontSize: '1rem' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none pointer-events-auto z-10"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {formData.password && (
                <div className="mt-2 mb-1">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-full rounded-full ${
                          index < passwordStrength
                            ? index === 0
                              ? "bg-red-500"
                              : index <= 2
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {passwordStrength === 0 && "Very weak"}
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Good"}
                    {passwordStrength === 4 && "Strong"}
                    {passwordStrength === 5 && "Very strong"}
                  </p>
                  <div className="text-xs text-red-500 mt-1">
                    {formData.password.length < 8 && <p>• Password must be at least 8 characters</p>}
                    {!/[a-z]/.test(formData.password) && <p>• Password must contain lowercase letters</p>}
                    {!/[A-Z]/.test(formData.password) && <p>• Password must contain uppercase letters</p>}
                    {!/[0-9]/.test(formData.password) && <p>• Password must contain digits</p>}
                    {!/[^A-Za-z0-9]/.test(formData.password) && <p>• Password must contain symbols</p>}
                  </div>
                </div>
              )}
              {errors.password && <ErrorMessage error={errors.password} id="password-error" />}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300 pr-12"
                  required
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  style={{ fontSize: '1rem' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none pointer-events-auto z-10"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && <ErrorMessage error={errors.confirmPassword} id="confirm-password-error" />}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-800 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                id="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Name shown to other users"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
                required
                aria-invalid={!!errors.display_name}
                aria-describedby={errors.display_name ? "display-name-error" : undefined}
                style={{ fontSize: '1rem' }}
              />
              {errors.display_name && <ErrorMessage error={errors.display_name} id="display-name-error" />}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || usernameExists}
              className={`w-full py-3 border-none rounded-lg text-white font-medium transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                isLoading || usernameExists
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              style={{ fontSize: '1rem' }}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileForm;
