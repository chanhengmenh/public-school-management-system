"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Wraps protected content. If the user's must_change_password flag is true,
 * redirects them to /change-password and blocks rendering.
 */
export function PasswordGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user?.must_change_password && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [user, loading, pathname, router]);

  // While checking or while redirecting, render nothing
  if (!loading && user?.must_change_password && pathname !== "/change-password") {
    return null;
  }

  return <>{children}</>;
}
