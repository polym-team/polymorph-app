// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

// 분리된 HTTP 메서드 핸들러들을 import
export { GET } from './get';
