export function EmptyList() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2 py-10 lg:py-20">
      <span>저장된 아파트가 없어요</span>
      <span className="text-sm text-gray-500 lg:text-base">
        원하는 아파트를 저장해보세요
      </span>
    </div>
  );
}
