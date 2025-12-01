import { ReactNode } from 'react';

interface TextContentProps {
  children: ReactNode;
}

export function TextContent({ children }: TextContentProps) {
  return (
    <div className="py-10 text-center text-sm text-gray-500 lg:py-20 lg:text-base">
      {children}
    </div>
  );
}
