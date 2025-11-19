import { Button } from '@package/ui';

interface FormButtonProps {
  isLoading: boolean;
  isChanged: boolean;
}

export function FormButton({ isLoading }: FormButtonProps) {
  return (
    <Button isLoading={isLoading} type="submit" variant="primary" size="lg">
      검색
    </Button>
  );
}
