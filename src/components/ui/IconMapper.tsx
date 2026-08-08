"use client";

import React from 'react';
import { 
  Door, 
  Briefcase, 
  Factory, 
  Crane, 
  Desktop, 
  MapPin, 
  User, 
  UserCircle,
  UserFocus,
  CheckCircle, 
  XCircle, 
  Lock, 
  Clock, 
  ArrowsIn, 
  ArrowsOut,
  Question,
  TrendUp,
  TrendDown,
  Users,
  ShieldCheck,
  Warning,
  Info,
  WarningCircle,
  Infinity,
  Globe
} from "@phosphor-icons/react";

interface IconMapperProps {
  icon?: string;
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  color?: string;
  className?: string;
}

/**
 * Component trung gian để chuyển đổi tên Icon từ API thành Phosphor Icons
 */
export const AreaIcon = ({ icon, size = 20, weight = "regular", color, className }: IconMapperProps) => {
  const props = { size, weight, color, className };

  switch (icon?.toLowerCase()) {
    case 'door':
    case 'reception':
      return <Door {...props} />;
    case 'briefcase':
    case 'office':
      return <Briefcase {...props} />;
    case 'factory':
    case 'workshop':
      return <Factory {...props} />;
    case 'crane':
    case 'construction':
      return <Crane {...props} />;
    case 'desktop':
    case 'it':
      return <Desktop {...props} />;
    case 'globe':
    case 'all':
      return <Globe {...props} />;
    case 'pin':
    case 'location':
      return <MapPin {...props} />;
    case 'users':
    case 'dept':
      return <Users {...props} />;
    default:
      return <MapPin {...props} />;
  }
};

/**
 * Component hiển thị trạng thái (Status Badge Icons)
 */
export const StatusIcon = ({ icon, size = 18, weight = "fill", color, className }: IconMapperProps) => {
  const props = { size, weight, color, className };

  switch (icon?.toLowerCase()) {
    case 'active':
    case 'success':
    case 'grant':
    case 'ok':
      return <CheckCircle {...props} color={color || "#10b981"} />;
    case 'resigned':
    case 'error':
    case 'deny':
    case 'fail':
      return <XCircle {...props} color={color || "#ef4444"} />;
    case 'locked':
    case 'warning':
      return <Lock {...props} color={color || "#f59e0b"} />;
    case 'expired':
    case 'out_of_time':
      return <Clock {...props} color={color || "#64748b"} />;
    case 'no_permission':
      return <ShieldCheck {...props} color={color || "#f43f5e"} />;
    case 'unknown':
      return <Question {...props} color={color || "#94a3b8"} />;
    case 'in':
      return <TrendUp {...props} color={color || "#10b981"} />;
    case 'out':
      return <TrendDown {...props} color={color || "#ef4444"} />;
    case 'infinity':
      return <Infinity {...props} />;
    default:
      return <Info {...props} />;
  }
};
