import { notFound } from 'next/navigation';
import { CallbackClient } from './CallbackClient';

// 개발 환경에서만 접근 가능 (프로덕션에서는 404)
export default function CallbackPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <CallbackClient />;
}
