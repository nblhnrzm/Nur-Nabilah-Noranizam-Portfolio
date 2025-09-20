"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/utils";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // If there's a session, check if user profile exists
      if (data?.session) {
        try {
          // Check if user profile already exists
          const response = await fetch('/api/check-user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.session.user.id }),
          });
          
          const profileData = await response.json();
          
          if (profileData.exists) {
            // Profile exists, redirect to home
            router.push("/");
          } else {
            // Profile doesn't exist, redirect to complete profile
            router.push("/complete-profile");
          }
        } catch (err) {
          console.error("Error checking user profile:", err);
          // If we can't check profile, assume it's a new Google user
          router.push("/complete-profile");
        }
      } else if (error) {
        console.error("Error during auth callback:", error);
        router.push("/sign-in?error=Authentication%20failed");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Authenticating...</h1>
        <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}