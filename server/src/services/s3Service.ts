import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/aws';

export default async function getSignedImageUrl(s3Key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });

    // Generate signed URL with 1 hour expiration for OpenAI to download
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating signed URL:', (error as Error).message);
    throw error;
  }
}
