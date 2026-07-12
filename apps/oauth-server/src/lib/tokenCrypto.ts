import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

/**
 * 구글 OAuth refresh/access token 을 DB 에 저장하기 전 암호화하는 유틸.
 *
 * - 알고리즘: AES-256-GCM (기밀성 + 무결성 태그)
 * - 키: 환경변수 GOOGLE_TOKEN_ENC_KEY (32바이트를 hex 64자 또는 base64 로 인코딩)
 * - 저장 포맷: base64( iv(12) || authTag(16) || ciphertext ) — 단일 문자열
 *
 * refresh token 은 절대 평문으로 저장하지 않으며, 이 유틸을 거친 암호문만 DB(google_calendar_grants)에 들어간다.
 */

const IV_LENGTH = 12; // GCM 권장 nonce 길이
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // AES-256

let cachedKey: Buffer | null = null;

/**
 * GOOGLE_TOKEN_ENC_KEY 를 32바이트 키로 파싱한다. hex(64자) 우선, 실패하면 base64 로 해석.
 * 키가 없거나 길이가 32바이트가 아니면 즉시 throw — 잘못된 키로 조용히 암호화되는 것을 막는다.
 */
function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.GOOGLE_TOKEN_ENC_KEY;
  if (!raw) {
    throw new Error(
      'GOOGLE_TOKEN_ENC_KEY 환경변수가 설정되지 않았습니다. 32바이트 키를 hex(64자) 또는 base64 로 지정하세요.',
    );
  }

  let key: Buffer | null = null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === KEY_LENGTH) key = decoded;
  }

  if (!key || key.length !== KEY_LENGTH) {
    throw new Error(
      'GOOGLE_TOKEN_ENC_KEY 가 32바이트가 아닙니다. hex 64자 또는 base64 로 인코딩된 32바이트 키여야 합니다.',
    );
  }

  cachedKey = key;
  return key;
}

/** 평문 토큰을 암호화해 저장용 단일 base64 문자열로 반환한다. */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
}

/** encryptToken 으로 만든 문자열을 복호화한다. 변조되었거나 키가 틀리면 throw. */
export function decryptToken(payload: string): string {
  const data = Buffer.from(payload, 'base64');
  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('암호문 형식이 올바르지 않습니다 (길이 부족).');
  }

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
