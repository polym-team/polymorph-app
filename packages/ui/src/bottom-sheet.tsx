'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@package/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isShown, setIsShown] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsClient(true);
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
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center',
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
        className="relative w-full max-w-lg bg-white shadow-2xl"
        style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          transform: isShown ? 'translateY(0px)' : 'translateY(100%)',
          transition: 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* iOS 스타일 헤더 */}
        {title && (
          <div className="border-b border-gray-200/50 p-4">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="px-0">{children}</div>
      </div>
    </div>,
    document.body
  );
};
