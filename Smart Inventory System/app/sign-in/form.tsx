"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";
import { supabase } from "../../lib/utils"; // Make sure to import supabase

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPersistentError, setIsPersistentError] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const emailValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    // Simple email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return "Invalid email format";
    return null;
  };

  // Password validation
  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  useEffect(() => {
    if (emailValidationTimeoutRef.current) {
      clearTimeout(emailValidationTimeoutRef.current);
    }
    
    if (emailTouched) {
      emailValidationTimeoutRef.current = setTimeout(() => {
        setEmailError(validateEmail(email));
      }, 1000);
    }
    
    return () => {
      if (emailValidationTimeoutRef.current) {
        clearTimeout(emailValidationTimeoutRef.current);
      }
    };
  }, [email, emailTouched]);
  useEffect(() => {
    setPasswordError(passwordTouched ? validatePassword(password) : null);
  }, [password, passwordTouched]);

  useEffect(() => {
    if (error && !isPersistentError) {
      setErrorVisible(true);
      const timer = setTimeout(() => setErrorVisible(false), 2500);
      return () => clearTimeout(timer);
    } else if (error && isPersistentError) {
      setErrorVisible(true);
    }
  }, [error, isPersistentError]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (formContainerRef.current) {
      formContainerRef.current.classList.add("animate-fade-slide-in");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFormIsLoading(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) {
      setFormIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // Check if email is unconfirmed
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          try {
            // Send confirmation email
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: email,
            });
            
            if (resendError) {
              setError('Your email address is unconfirmed. We\'ve sent a confirmation link—please check your inbox.');
              setIsPersistentError(true);
            } else {
              setError('Your email address is unconfirmed. We\'ve sent a confirmation link—please check your inbox.');
              setIsPersistentError(true);
            }
          } catch (resendErr) {
            setError('Your email address is unconfirmed. We\'ve sent a confirmation link—please check your inbox.');
            setIsPersistentError(true);
          }
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(true);
        setMessage("Login successful!");
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setFormIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");
      
      // Sign in with Google using Supabase Auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        setError(error.message);
        console.error("Google sign-in error:", error);
      }
      // No need to handle success here as the OAuth flow will redirect the user
    } catch (err) {
      console.error("Unexpected error during Google sign-in:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsResetLoading(true);
    
    if (!email) {
      setError("Please enter your email address");
      setIsResetLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset email sent! Please check your inbox and follow the instructions.");
        setShowForgotPassword(false);
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f0f4f8' }}>
      <div
        ref={formContainerRef}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-fade-slide-in"
        style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}
        aria-label={showForgotPassword ? 'Reset Password Form' : 'Sign In Form'}
      >
        <div>
          <h2 className="text-center text-xl font-bold text-gray-800 mb-4">
            {showForgotPassword ? "Reset your password" : "Sign in to your account"}
          </h2>
        </div>

        {/* Error Animation */}
        <div
          className={`transition-opacity duration-500 ${errorVisible && error ? 'opacity-100' : 'opacity-0'} ${error ? 'block' : 'hidden'} bg-red-50 border-l-4 border-red-400 p-3 text-red-700 mb-3 rounded-md`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <p className="text-sm" id="error-message">{error}</p>
        </div>

        {/* Success Animation */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 text-green-700 mb-3 rounded-md animate-success-bounce" role="status">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {!showForgotPassword ? (
          <>
            {/* Sign In Form */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex justify-center items-center gap-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-300"
                aria-label="Sign in with Google"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
                  {/* Google SVG ...existing code... */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                </div>
                <span className="text-gray-800 font-medium text-sm">
                  {isGoogleLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full inline-block"></span>
                      Signing in...
                    </span>
                  ) : "Sign in with Google"}
                </span>
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit} aria-label="Sign in form">
              <div className="space-y-3">
                <div className="relative">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-800 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" style={{ zIndex: 2 }}>
                      {/* Email icon */}
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6h16v12H4z"/><path stroke="currentColor" strokeWidth="2" d="M4 6l8 7 8-7"/></svg>
                    </span>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-label="Email address"
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "email-error" : undefined}
                      className={`w-full pl-10 pr-3 py-2.5 border ${emailError ? 'border-red-400' : 'border-gray-300'} rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300`}
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => { 
                        setEmail(e.target.value); 
                        setEmailTouched(true);
                        // Clear persistent error when user starts typing
                        if (isPersistentError) {
                          setError(null);
                          setIsPersistentError(false);
                          setErrorVisible(false);
                        }
                      }}
                      onBlur={() => setEmailTouched(true)}
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                  {emailError && (
                    <span className="text-xs text-red-500 mt-1 block animate-fade-in" id="email-error" role="alert">{emailError}</span>
                  )}
                </div>
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" style={{ zIndex: 2 }}>
                      {/* Lock icon */}
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M12 14v2"/><path stroke="currentColor" strokeWidth="2" d="M8 10V8a4 4 0 1 1 8 0v2"/></svg>
                    </span>
                    <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    aria-label="Password"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    className={`w-full pl-10 pr-10 py-2.5 border ${passwordError ? 'border-red-400' : 'border-gray-300'} rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      setPasswordTouched(true);
                      // Clear persistent error when user starts typing
                      if (isPersistentError) {
                        setError(null);
                        setIsPersistentError(false);
                        setErrorVisible(false);
                      }
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    style={{ fontSize: '1rem' }}
                    />
                    {/* Show/Hide Password Toggle */}
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path stroke="currentColor" strokeWidth="2" d="M1 1l22 22"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="text-xs text-red-500 mt-1 block animate-fade-in" id="password-error" role="alert">{passwordError}</span>
                  )}
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center mt-2">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe((v) => !v)}
                    className="h-4 w-4 border border-gray-300 rounded appearance-none focus:ring-blue-500 bg-white checked:bg-blue-600 checked:border-blue-600 flex-shrink-0"
                    aria-label="Remember me"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', boxShadow: 'none' }}
                  />
                  {rememberMe && (
                    <svg 
                      className="absolute top-0 left-0 h-4 w-4 text-white pointer-events-none" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-800 leading-4">
                  Remember me
                </label>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={formIsLoading || isLoading}
                  className="w-full py-2.5 border-none rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-300 cursor-pointer flex items-center justify-center"
                  style={{ fontSize: '1rem' }}
                  aria-label="Sign in"
                  aria-busy={formIsLoading || isLoading}
                >
                  {(formIsLoading || isLoading) ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      Signing in...
                    </span>
                  ) : "Sign in"}
                </button>
              </div>
            </form>

            <div className="text-center mt-3 text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:underline mb-3 bg-transparent border-none cursor-pointer"
                aria-label="Forgot your password?"
              >
                Forgot your password?
              </button>
            </div>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a 
                  href="/sign-up" 
                  className="text-blue-600 no-underline hover:underline cursor-pointer"
                  aria-label="Sign up"
                >
                  Sign up
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Forgot Password Form */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleForgotPassword} aria-label="Forgot password form">
              <div className="relative">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-800 mb-1">
                  Email address
                </label>
                <span className="absolute left-3 top-9 text-gray-400 pointer-events-none">
                  {/* Email icon */}
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6h16v12H4z"/><path stroke="currentColor" strokeWidth="2" d="M4 6l8 7 8-7"/></svg>
                </span>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-label="Email address"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '1rem' }}
                />
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-2.5 border-none rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-300 cursor-pointer flex items-center justify-center"
                  style={{ fontSize: '1rem' }}
                  aria-label="Send reset email"
                  aria-busy={isResetLoading}
                >
                  {isResetLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                      Sending...
                    </span>
                  ) : "Send reset email"}
                </button>
              </div>
            </form>

            <div className="text-center mt-3 text-sm">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                aria-label="Back to sign in"
              >
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
      {/* Animations CSS */}
      <style jsx>{`
        .animate-fade-slide-in {
          animation: fadeSlideIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-success-bounce {
          animation: bounceIn 0.7s;
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        #remember-me {
          background-color: white !important;
          border: 1px solid #d1d5db;
        }
        #remember-me:checked {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
      `}</style>
    </div>
  );
}
