export function NewIcon() {
  return (
    <div className="relative">
      <span className="bg-danger text-primary-foreground flex h-4 items-center justify-center rounded-[4px] px-1 pt-[1px] text-[9px]">
        NEW
      </span>
      <div className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="border-t-danger border-l-[3px] border-r-[3px] border-t-[3px] border-l-transparent border-r-transparent"></div>
      </div>
    </div>
  );
}
