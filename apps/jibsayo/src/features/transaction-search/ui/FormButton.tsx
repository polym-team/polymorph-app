import { RotateCw, Search } from 'lucide-react';

import { Button } from '@package/ui';

interface FormButtonProps {
  isLoading: boolean;
  isChanged: boolean;
}

export function FormButton({ isLoading, isChanged }: FormButtonProps) {
  return (
    <Button isLoading={isLoading} type="submit" variant="primary" size="lg">
      {isChanged && (
        <span className="inline-flex animate-[pulse_1s_ease-in-out_infinite] items-center gap-2">
          <RotateCw className="h-5 w-5 stroke-[3.5]" />
          다시 검색
        </span>
      )}
      {!isChanged && (
        <span className="inline-flex items-center gap-2">
          <Search className="h-5 w-5 stroke-[3.5]" />
          검색
        </span>
      )}
    </Button>
  );
}
