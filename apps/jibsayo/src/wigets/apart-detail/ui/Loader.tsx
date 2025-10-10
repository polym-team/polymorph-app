import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="fixed inset-0 flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded border border-gray-100 bg-white/70 p-8 text-gray-600 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span>데이터를 조회하고 있어요</span>
      </div>
    </div>
  );
}
