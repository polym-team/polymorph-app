import { Button } from '@package/ui';

export function FormButton() {
  return (
    <div className="flex gap-2">
      <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
        검색
      </Button>
      <Button
        type="button"
        variant="warning"
        className="flex-shrink-0"
        onClick={() => {
          // FIXME: 작업 필요
        }}
      >
        저장
      </Button>
    </div>
  );
}
