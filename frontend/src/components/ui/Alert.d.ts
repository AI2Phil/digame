import React from 'react';

export interface AlertProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<any>>;

export interface AlertTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export interface AlertDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export interface AlertIconProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  className?: string;
}

export const AlertTitle: React.ForwardRefExoticComponent<AlertTitleProps & React.RefAttributes<any>>;
export const AlertDescription: React.ForwardRefExoticComponent<AlertDescriptionProps & React.RefAttributes<any>>;
export const AlertIcon: React.FC<AlertIconProps>;

export const AlertVariants: any;
export const useAlert: () => any;
export const AlertContainer: React.FC<any>;

export default Alert;