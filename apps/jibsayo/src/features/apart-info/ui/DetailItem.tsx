import { cn } from '@package/utils';

interface DetailItemProsp {
  title: string;
  content: string;
  subContent?: string;
  highlight?: boolean;
}

export function DetailItem({
  title,
  content,
  subContent,
  highlight,
}: DetailItemProsp) {
  return (
    <div className="flex flex-col px-3.5 py-3 lg:justify-start">
      <span className="whitespace-nowrap text-sm text-gray-400 lg:w-36 lg:text-base">
        {title}
      </span>
      <div className="mt-2 flex flex-col gap-y-1">
        <span className={cn('font-semibold', highlight && 'text-primary')}>
          {content}
        </span>
        {subContent && (
          <span className="text-xs text-gray-400">{subContent}</span>
        )}
      </div>
    </div>
  );
}
