import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode | string | null;
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps>;
export const TagBadge: React.FC<any>;

export default Badge;