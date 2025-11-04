export const obfuscateKorean = (text: string): string => {
  return Buffer.from(text)
    .toString('base64')
    .replace(/\s/g, '_')
    .replace(/[+/=]/g, '');
};
