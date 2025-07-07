'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg relative cursor-pointer hover:opacity-90 transition-opacity',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'group-[.toast]:text-transparent hover:group-[.toast]:text-transparent !absolute !top-0 !left-0 !right-0 !bottom-0 !w-full !h-full !p-0 !m-0 !border-0 !bg-transparent !cursor-pointer [&>*]:!hidden [&>*]:!opacity-0 [&>*]:!invisible !z-50 !pointer-events-auto',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
