import { cn } from '@package/utils';

type Variant = 'primary' | 'accent' | 'subtle' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  // 주 CTA — 웜 차콜 솔리드
  primary: 'bg-ink-900 text-paper hover:bg-ink-900/90',
  // 포인트 — clay
  accent: 'bg-clay-500 text-white hover:bg-clay-600',
  // 보조 — 라인 아웃라인
  subtle: 'bg-paper-card text-ink-600 border border-line hover:border-clay-500/60 hover:text-ink-900',
  // 위험 — terracotta
  danger: 'bg-terra-500 text-white hover:bg-terra-600',
  // 텍스트만
  ghost: 'text-ink-600 hover:text-ink-900 hover:bg-line-soft',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-400 disabled:border-transparent',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
