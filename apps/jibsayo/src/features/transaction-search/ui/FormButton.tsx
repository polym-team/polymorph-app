import { Button } from '@package/ui';

interface FormButtonProps {
  isLoading: boolean;
  isChanged: boolean;
}

export function FormButton({ isChanged }: FormButtonProps) {
  return (
    <Button type="submit" variant="primary">
      {isChanged ? '다시 검색' : '검색'}
    </Button>
  );
}
