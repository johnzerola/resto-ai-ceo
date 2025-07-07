import React from 'react';
import { ModernNavItem } from './ModernNavItem';
import { useUserRole } from '@/hooks/useUserRole';
import { LucideIcon } from 'lucide-react';

interface ConditionalNavItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isCollapsed: boolean;
  category: string;
  requiredRole?: 'developer' | 'affiliate' | 'admin';
}

export function ConditionalNavItem({ 
  requiredRole, 
  ...navItemProps 
}: ConditionalNavItemProps) {
  const { hasRole, loading } = useUserRole();

  if (loading) return null;
  
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <ModernNavItem {...navItemProps} />;
}