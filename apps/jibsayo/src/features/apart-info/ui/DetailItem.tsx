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
    <div className="flex flex-col items-start gap-y-1 rounded bg-gray-100 px-4 py-3">
      <span className="whitespace-nowrap text-sm text-gray-600 lg:w-36 lg:text-base">
        {title}
      </span>
      <div className="flex flex-col">
        <span
          className={cn(
            'font-semibold lg:text-xl',
            highlight && 'text-primary'
          )}
        >
          {content}
        </span>
        {subContent && (
          <span className="text-xs text-gray-500 lg:text-sm">{subContent}</span>
        )}
      </div>
    </div>
  );
}
