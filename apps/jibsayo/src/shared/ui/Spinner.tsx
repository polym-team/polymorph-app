'use client';

export function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <style jsx>{`
        @keyframes fastBounce {
          0%,
          100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-150%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .dot {
          animation: fastBounce 0.5s infinite;
        }
        .dot-1 {
          animation-delay: 0s;
        }
        .dot-2 {
          animation-delay: 0.1s;
        }
        .dot-3 {
          animation-delay: 0.2s;
        }
      `}</style>
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-primary-500 rounded-full dot dot-1"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full dot dot-2"></div>
        <div className="w-3 h-3 bg-primary-500 rounded-full dot dot-3"></div>
      </div>
    </div>
  );
}
