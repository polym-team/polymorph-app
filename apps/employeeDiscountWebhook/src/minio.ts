import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = 'share-discount-products';
const ENDPOINT = 'https://minio.polymorph.co.kr';

export async function uploadHtml(html: string, key: string): Promise<string> {
  const client = new S3Client({
    endpoint: ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.POLYMORPH_MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.POLYMORPH_MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: html,
      ContentType: 'text/html; charset=utf-8',
    }),
  );

  return `${ENDPOINT}/${BUCKET}/${key}`;
}
