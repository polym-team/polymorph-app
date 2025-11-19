export function EmptyApartList() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2 py-10">
      <span>저장된 아파트가 없어요</span>
      <span className="text-sm text-gray-500">
        원하는 아파트를 저장해보세요
      </span>
    </div>
  );
}
