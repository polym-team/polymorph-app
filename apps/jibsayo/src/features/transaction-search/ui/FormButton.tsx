import { Button } from '@package/ui';

interface FormButtonProps {
  isLoading: boolean;
  isChanged: boolean;
}

export function FormButton({ isLoading, isChanged }: FormButtonProps) {
  return (
    <Button isLoading={isLoading} type="submit" variant="primary">
      {isChanged ? '다시 검색' : '검색'}
    </Button>
  );
}
