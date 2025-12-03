/**
 * 한글을 안전하게 인코딩합니다 (URL-safe Base64)
 * 완벽한 복호화를 위해 Base64 특수문자를 안전한 문자로 대체합니다
 * + → - (하이픈)
 * / → _ (언더스코어)
 * = 패딩은 길이로 복원 가능하므로 제거
 */
export const obfuscateKorean = (text: string): string => {
  return Buffer.from(text)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * obfuscateKorean으로 인코딩된 문자열을 복호화합니다
 */
export const deobfuscateKorean = (encoded: string): string => {
  try {
    // URL-safe Base64를 표준 Base64로 변환
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    // 패딩 복원 (Base64는 4의 배수여야 함)
    const padLength = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(padLength);

    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('deobfuscateKorean 복호화 실패:', { encoded, error });
    return '';
  }
};
