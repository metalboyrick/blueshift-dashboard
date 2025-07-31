"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    isLoggedIn: context.status === "signed-in",
    isLoggingIn: context.status === "signing-in",
    isLoggingOut: context.status === "signing-out",
  };
}
