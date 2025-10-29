import { Slot } from '@radix-ui/react-slot';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@package/utils';

// 로딩 아이콘 컴포넌트
const LoadingIcon = () => (
  <div className="flex items-center gap-1.5">
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-current"
      style={{
        animationDelay: '0ms',
        animationDuration: '1000ms',
      }}
    />
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-current"
      style={{
        animationDelay: '200ms',
        animationDuration: '1000ms',
      }}
    />
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-current"
      style={{
        animationDelay: '400ms',
        animationDuration: '1000ms',
      }}
    />
  </div>
);

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded ring-offset-background transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border will-change-transform scale-x-[1] scale-y-[1] active:scale-95',
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
        default: 'h-[46px] px-4 py-[15px]',
        xs: 'h-[30px] rounded px-3 py-[6px] text-sm',
        sm: 'h-[36px] rounded px-4 py-[10px] text-sm',
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
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
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
