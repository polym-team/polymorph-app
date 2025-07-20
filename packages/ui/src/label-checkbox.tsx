'use client';

import { CheckedState } from '@radix-ui/react-checkbox';

import * as React from 'react';

import { cn } from '@package/utils';

import { Checkbox } from './checkbox';
import { Label } from './label';

export interface LabelCheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  title: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const LabelCheckbox = React.forwardRef<
  React.ElementRef<typeof Label>,
  LabelCheckboxProps
>(
  (
    {
      id,
      checked,
      onCheckedChange,
      title,
      description,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const handleCheckedChange = (checkedState: CheckedState) => {
      onCheckedChange?.(checkedState === true);
    };

    return (
      <Label
        ref={ref}
        className={cn(
          'hover:bg-accent/50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/10 dark:has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:bg-primary/20 flex cursor-pointer items-start justify-center gap-2 rounded border bg-white p-3',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        {...props}
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm font-medium leading-none">{title}</p>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </Label>
    );
  }
);

LabelCheckbox.displayName = 'LabelCheckbox';

export { LabelCheckbox };
