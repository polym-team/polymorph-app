import * as React from 'react';

import { cn } from '@package/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-card text-card-foreground rounded border border-gray-100',
      className
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> & {
  Header: typeof CardHeader;
  Footer: typeof CardFooter;
  Content: typeof CardContent;
  Divider: typeof CardDivider;
};
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-b border-gray-100 p-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('border-t border-gray-100 p-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

const CardDivider = () => <hr className="h-[1px] w-full border-gray-100" />;

Card.Header = CardHeader;
Card.Footer = CardFooter;
Card.Content = CardContent;
Card.Divider = CardDivider;

export { Card };
