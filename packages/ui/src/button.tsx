import { Slot } from '@radix-ui/react-slot';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@package/utils';

// 로딩 아이콘 컴포넌트
const LoadingIcon = () => (
  <div className="flex items-center gap-1.5">
    <div
      className="h-2 w-2 animate-bounce rounded-full bg-current"
      style={{
        animationDelay: '0ms',
        animationDuration: '600ms',
      }}
    />
    <div
      className="h-2 w-2 animate-bounce rounded-full bg-current"
      style={{
        animationDelay: '150ms',
        animationDuration: '600ms',
      }}
    />
    <div
      className="h-2 w-2 animate-bounce rounded-full bg-current"
      style={{
        animationDelay: '300ms',
        animationDuration: '600ms',
      }}
    />
  </div>
);

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded ring-offset-background transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border active:shadow-md active:shadow-gray-500/50',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-default text-default-foreground hover:bg-default/80',
        primary:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        'primary-outline': 'border-primary bg-primary/10 hover:bg-primary/20',
        danger:
          'border-transparent bg-danger text-danger-foreground hover:bg-danger/90',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/90',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'border-transparent hover:bg-accent hover:text-accent-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4 py-3',
        xs: 'rounded px-2 py-1.5 text-xs active:shadow-sm active:shadow-gray-500/40',
        sm: 'rounded px-3 py-2.5 text-sm active:shadow-sm active:shadow-gray-500/45',
        lg: 'rounded px-8 py-3.5 text-base',
        icon: 'p-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="invisible">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingIcon />
            </div>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
