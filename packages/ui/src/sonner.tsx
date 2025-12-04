'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group [&]:!left-1/2 [&]:!top-1/2 [&]:!-translate-x-1/2 [&]:!-translate-y-1/2 [&_li]:!mx-auto [&_ol]:!flex [&_ol]:!flex-col [&_ol]:!items-center [&_ol]:!justify-center"
      position="top-center"
      closeButton={true}
      visibleToasts={1}
      duration={3000}
      toastOptions={{
        classNames: {
          toast:
            '!bg-gray-800 !text-white !border-gray-700 !shadow-lg !w-fit !max-w-[90vw] !text-center [&_[data-icon]]:!hidden [&_svg]:!hidden !left-0 !right-0 !mx-auto ',
          description: '!text-gray-200 !text-center',
          closeButton:
            '!absolute !top-0 !left-0 !w-full !h-full !bg-transparent !border-0 !cursor-pointer [&>*]:!hidden !transform-none',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
