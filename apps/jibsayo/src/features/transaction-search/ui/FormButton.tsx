import { RotateCw, Search } from 'lucide-react';

import { Button } from '@package/ui';

interface FormButtonProps {
  isLoading: boolean;
  isChanged: boolean;
}

export function FormButton({ isLoading, isChanged }: FormButtonProps) {
  return (
    <Button
      isLoading={isLoading}
      type="submit"
      variant="primary"
      className="font-extrabold"
    >
      {isChanged && (
        <>
          <RotateCw className="h-5 w-5 animate-spin stroke-[3.5]" />
          다시 검색
        </>
      )}
      {!isChanged && (
        <>
          <Search className="h-5 w-5 stroke-[3.5]" />
          검색
        </>
      )}
    </Button>
  );
}
