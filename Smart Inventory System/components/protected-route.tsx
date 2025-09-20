"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Updated path to match your new sign-in page location
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}