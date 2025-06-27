import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Define button variants using cva with comprehensive styling
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed theme-transition',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-800',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600 focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800',
        outline: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-800',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md dark:bg-red-500 dark:hover:bg-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-800',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md dark:bg-green-500 dark:hover:bg-green-600 focus-visible:ring-green-500 dark:focus-visible:ring-offset-gray-800',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md dark:bg-yellow-600 dark:hover:bg-yellow-700 focus-visible:ring-yellow-500 dark:focus-visible:ring-offset-gray-800',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

// ButtonGroup component with TypeScript
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: VariantProps<typeof buttonVariants>['size'];
  variant?: VariantProps<typeof buttonVariants>['variant'];
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  return (
    <div className={cn('inline-flex rounded-lg shadow-sm', className)} role="group">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<ButtonProps>(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child, {
            ...child.props,
            size,
            variant,
            className: cn(
              child.props.className,
              isFirst && 'rounded-r-none',
              isLast && 'rounded-l-none',
              !isFirst && !isLast && 'rounded-none',
              !isFirst && 'border-l-0'
            )
          } as ButtonProps);
        }
        return child;
      })}
    </div>
  );
};

// IconButton component with TypeScript
interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, variant = 'ghost', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
      xl: 'p-4'
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { Button, buttonVariants };
export default Button;
