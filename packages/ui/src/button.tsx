import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@package/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gray-300 bg-white hover:bg-gray-100",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100",
        link: "text-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded px-3",
        lg: "h-11 rounded px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
