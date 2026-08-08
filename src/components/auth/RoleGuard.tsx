"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * This component conditionally renders its children based on the user's role.
 * 
 * Usage:
 * <RoleGuard allowedRoles={['admin']}>
 *   <button>Sync Data</button>
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback = null }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // If no user or role doesn't match, return fallback
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
