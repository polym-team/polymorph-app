import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@package/utils';

const inputVariants = cva(
  'border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-sm border file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'px-3 py-2.5',
        sm: 'px-3 py-2',
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
  ({ className, type, size, style, ...props }, ref) => {
    // size variant에 따른 fontSize 설정
    const targetFontSize = size === 'sm' ? 14 : 16;

    // iOS Safari 확대 방지를 위해 16px 고정 + scale로 크기 조정
    const fontScale = targetFontSize / 16;

    const inputStyle: React.CSSProperties = {
      fontSize: '16px',
      ...(fontScale !== 1 && {
        transform: `scale(${fontScale})`,
        transformOrigin: 'left top',
      }),
      ...style,
    };

    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        style={inputStyle}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
