export function LoadingFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-gradient-to-b from-white to-gray-50 md:min-h-[600px]">
      <div className="flex flex-col items-center gap-14">
        <div className="relative">
          <div className="bg-primary/10 absolute -inset-4 animate-ping rounded-full" />
          <div className="border-primary relative h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-base font-medium text-gray-700 md:text-base">
            데이터를 불러오고 있어요.
          </span>
          <span className="text-sm text-gray-500">잠시만 기다려주세요.</span>
        </div>
      </div>
    </div>
  );
}
