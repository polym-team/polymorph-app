'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@package/utils';

const BottomSheetContext = React.createContext<{
  onClose: () => void;
}>({
  onClose: () => {},
});

interface HeaderProps {
  children: React.ReactNode;
}

function Header({ children }: HeaderProps) {
  const { onClose } = React.useContext(BottomSheetContext);

  return (
    <div className="flex items-center justify-between border-b border-gray-200/50 p-4 pt-5">
      <h2 className="font-semibold">{children}</h2>
      <button onClick={onClose}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

interface BodyProps {
  children: React.ReactNode;
}

function Body({ children }: BodyProps) {
  return (
    <div className="scrollbar-hide max-h-[75vh] overflow-y-auto p-4">
      {children}
    </div>
  );
}

interface FooterProps {
  children: React.ReactNode;
}

function Footer({ children }: FooterProps) {
  return <div className="border-t border-gray-200/50 p-4">{children}</div>;
}

interface BottomSheetProps {
  isOpen: boolean;
  size?: 'xs' | 'sm' | 'lg';
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> & {
  Header: React.FC<HeaderProps>;
  Body: React.FC<BodyProps>;
  Footer: React.FC<FooterProps>;
} = ({ isOpen, size, onClose, children }) => {
  const [isClient, setIsClient] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isShown, setIsShown] = React.useState(false);
  const [isLarge, setIsLarge] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsLarge(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLarge(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';

      // 애니메이션을 보장하기 위해 다음 frame에서 상태 업데이트
      requestAnimationFrame(() => {
        setIsShown(true);
      });
    } else {
      setIsShown(false);
      const timer = setTimeout(() => setIsAnimating(false), 150);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 바텀시트 내용 부분을 클릭한 경우 닫지 않음
    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      return;
    }
    onClose();
  };

  if (!isClient || (!isOpen && !isAnimating)) return null;

  return createPortal(
    <BottomSheetContext.Provider value={{ onClose }}>
      <div
        className={cn(
          'fixed inset-0 z-50 flex justify-center',
          isLarge ? 'items-center' : 'items-end',
          isShown ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transition: 'opacity 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          pointerEvents: isShown ? 'auto' : 'none',
        }}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          style={{
            transition: 'opacity 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        />

        {/* Bottom Sheet */}
        <div
          ref={contentRef}
          className={cn(
            'relative w-full bg-white shadow-2xl',
            isLarge && 'rounded',
            !size && 'max-w-screen-md',
            size === 'lg' && 'max-w-screen-md lg:max-w-screen-lg',
            size === 'sm' && 'max-w-screen-md lg:max-w-screen-sm',
            size === 'xs' && 'lg:max-w-screen-xs max-w-screen-md'
          )}
          style={{
            borderTopLeftRadius: !isLarge ? '20px' : undefined,
            borderTopRightRadius: !isLarge ? '20px' : undefined,
            transform: isLarge
              ? 'none'
              : isShown
                ? 'translateY(0px)'
                : 'translateY(100%)',
            opacity: isLarge ? (isShown ? 1 : 0) : 1,
            transition: isLarge
              ? 'opacity 150ms cubic-bezier(0.4, 0.0, 0.2, 1)'
              : 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            willChange: isLarge ? 'opacity' : 'transform',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-0">{children}</div>
        </div>
      </div>
    </BottomSheetContext.Provider>,
    document.body
  );
};

BottomSheet.Header = Header;
BottomSheet.Body = Body;
BottomSheet.Footer = Footer;
