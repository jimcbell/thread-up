import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

if (!S3_BUCKET) {
  console.warn('⚠️  Warning: S3_BUCKET_NAME not configured');
}

export { s3Client, S3_BUCKET };
