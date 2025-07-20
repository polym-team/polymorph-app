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
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startedDragging, setStartedDragging] = React.useState(false);
  const [handleClicked, setHandleClicked] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const handleRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef(0);
  const currentYRef = React.useRef(0);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragOffset(0);
      setStartedDragging(false);
      setHandleClicked(false);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (isDragging || handleClicked) return;

    // 핸들 영역 클릭인지 확인
    if (handleRef.current && handleRef.current.contains(e.target as Node)) {
      setHandleClicked(true);
      setTimeout(() => setHandleClicked(false), 100);
      return; // 핸들 영역 클릭 시 아무것도 하지 않음
    }

    // 바텀시트 내용 부분을 클릭한 경우 닫지 않음
    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      return;
    }
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setStartedDragging(false);
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === 0) return;

    e.preventDefault();
    e.stopPropagation();

    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;

    // 10px 이상 움직였을 때만 드래그로 인식하고 isDragging을 true로 설정
    if (Math.abs(deltaY) > 10 && !startedDragging) {
      setStartedDragging(true);
      setIsDragging(true);
    }

    // 드래그가 시작된 후에만 offset 적용
    if (startedDragging) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 드래그 상태 리셋
    startYRef.current = 0;

    if (!startedDragging) {
      // 클릭만 한 경우 아무것도 하지 않음
      return;
    }

    setIsDragging(false);

    // 아래로 드래그했으면 닫기 (dragOffset > 0)
    if (dragOffset > 0) {
      onClose();
    } else {
      // 위로 드래그했거나 움직이지 않았으면 원래 위치로 복원
      setDragOffset(0);
    }

    setStartedDragging(false);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setStartedDragging(false);
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseEnd);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (startYRef.current === 0) return;

    e.preventDefault();
    e.stopPropagation();

    currentYRef.current = e.clientY;
    const deltaY = currentYRef.current - startYRef.current;

    // 10px 이상 움직였을 때만 드래그로 인식하고 isDragging을 true로 설정
    if (Math.abs(deltaY) > 10 && !startedDragging) {
      setStartedDragging(true);
      setIsDragging(true);
    }

    // 드래그가 시작된 후에만 offset 적용
    if (startedDragging) {
      setDragOffset(deltaY);
    }
  };

  const handleMouseEnd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 드래그 상태 리셋
    startYRef.current = 0;

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseEnd);

    if (!startedDragging) {
      // 클릭만 한 경우 아무것도 하지 않음
      return;
    }

    setIsDragging(false);

    // 아래로 드래그했으면 닫기 (dragOffset > 0)
    if (dragOffset > 0) {
      onClose();
    } else {
      // 위로 드래그했거나 움직이지 않았으면 원래 위치로 복원
      setDragOffset(0);
    }

    setStartedDragging(false);
  };

  if (!isClient || (!isOpen && !isAnimating)) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        transition: 'opacity 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{
          transition: 'opacity 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
      />

      {/* Bottom Sheet */}
      <div
        ref={contentRef}
        className="relative w-full max-w-lg bg-white shadow-2xl"
        style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          transform: isDragging
            ? `translateY(${dragOffset}px)`
            : isOpen
              ? 'translateY(0)'
              : 'translateY(100%)',
          transition: isDragging
            ? 'none'
            : 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* iOS 스타일 핸들 */}
        <div
          ref={handleRef}
          className="flex cursor-grab select-none justify-center pb-3 pt-2 active:cursor-grabbing"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseStart}
        >
          <div
            className="select-none rounded-full bg-gray-300"
            style={{
              width: '36px',
              height: '5px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />
        </div>

        {/* iOS 스타일 헤더 */}
        {title && (
          <div className="border-b border-gray-200/50 px-4 pb-4">
            <div className="flex items-center justify-center">
              <h3 className="text-center text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-0">{children}</div>
      </div>
    </div>,
    document.body
  );
};
