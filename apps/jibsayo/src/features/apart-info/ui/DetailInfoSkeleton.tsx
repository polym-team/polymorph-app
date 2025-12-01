export function DetailInfoSkeleton() {
  const items = ['세대수', '주차', '용적률 / 건폐율'];
  const widths = [
    'w-[50px]',
    'w-[60px]',
    'w-[70px]',
    'w-[80px]',
    'w-[90px]',
    'w-[100px]',
  ];

  const getRandomWidth = () => {
    return widths[Math.floor(Math.random() * widths.length)];
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* 아파트 이름과 주소 스켈레톤 */}
      <div className="flex flex-col gap-y-2">
        {/* 아파트 이름 */}
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200 lg:h-7" />
        {/* 주소 */}
        <div className="h-5 w-64 animate-pulse rounded bg-gray-200 lg:h-5 lg:w-80" />
      </div>

      {/* 세부 정보 스켈레톤 */}
      <div className="flex flex-col gap-y-2">
        {items.map(item => (
          <div
            key={item}
            className="flex items-center justify-between gap-x-3 break-keep rounded bg-gray-100 p-3 lg:justify-start"
          >
            <div
              className={`h-5 ${getRandomWidth()} animate-pulse rounded bg-gray-200 lg:h-6 lg:w-36`}
            />
            <div
              className={`h-5 ${getRandomWidth()} animate-pulse rounded bg-gray-200 lg:h-6`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
