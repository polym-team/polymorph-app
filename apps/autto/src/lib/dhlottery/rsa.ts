import forge from 'node-forge';

/**
 * RSA PKCS1_v1.5 암호화 (동행복권 로그인용)
 * Python의 Crypto.Cipher.PKCS1_v1_5 와 동일한 동작
 */
export function rsaEncrypt(
  plainText: string,
  modulusHex: string,
  exponentHex: string,
): string {
  const n = new forge.jsbn.BigInteger(modulusHex, 16);
  const e = new forge.jsbn.BigInteger(exponentHex, 16);
  const publicKey = forge.pki.setRsaPublicKey(n, e);
  const encrypted = publicKey.encrypt(plainText, 'RSAES-PKCS1-V1_5');
  return forge.util.bytesToHex(encrypted);
}
