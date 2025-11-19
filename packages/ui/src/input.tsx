import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@package/utils';

const inputVariants = cva(
  'bg-gray-100 ring-offset-background file:text-foreground placeholder:text-muted-foreground flex w-full rounded file:border-0 file:bg-transparent file:font-medium outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 active:brightness-90',
  {
    variants: {
      size: {
        default: 'h-[48px] px-4 ',
        sm: 'h-[40px] px-3 ',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
