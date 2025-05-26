import * as React from "react";
import { cn } from "@package/utils";

interface TypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "blockquote"
    | "code"
    | "lead"
    | "large"
    | "small"
    | "muted";
  children: React.ReactNode;
  className?: string;
}

export function Typography({
  variant = "p",
  children,
  className,
  ...props
}: TypographyProps) {
  const baseClasses = getVariantClasses(variant);

  switch (variant) {
    case "h1":
      return (
        <h1 className={cn(baseClasses, className)} {...props}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 className={cn(baseClasses, className)} {...props}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 className={cn(baseClasses, className)} {...props}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 className={cn(baseClasses, className)} {...props}>
          {children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote className={cn(baseClasses, className)} {...props}>
          {children}
        </blockquote>
      );
    case "code":
      return (
        <code className={cn(baseClasses, className)} {...props}>
          {children}
        </code>
      );
    default:
      return (
        <p className={cn(baseClasses, className)} {...props}>
          {children}
        </p>
      );
  }
}

function getVariantClasses(variant: TypographyProps["variant"]) {
  switch (variant) {
    case "h1":
      return "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl";
    case "h2":
      return "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0";
    case "h3":
      return "scroll-m-20 text-2xl font-semibold tracking-tight";
    case "h4":
      return "scroll-m-20 text-xl font-semibold tracking-tight";
    case "p":
      return "leading-7 [&:not(:first-child)]:mt-6";
    case "blockquote":
      return "mt-6 border-l-2 pl-6 italic";
    case "code":
      return "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold";
    case "lead":
      return "text-xl text-muted-foreground";
    case "large":
      return "text-lg font-semibold";
    case "small":
      return "text-sm font-medium leading-none";
    case "muted":
      return "text-sm text-muted-foreground";
    default:
      return "leading-7 [&:not(:first-child)]:mt-6";
  }
}
