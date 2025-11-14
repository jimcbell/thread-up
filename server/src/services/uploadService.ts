import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/aws';
import db from '../config/database';
import { randomUUID } from 'crypto';

interface SignedUrl {
  image_id: string;
  url: string;
  s3_key: string;
}

interface CreateUploadSessionResponse {
  upload_id: string;
  signed_urls: SignedUrl[];
}

interface UploadStatusResponse {
  upload_id: string;
  status: string;
  image_count: number;
  processed_count: number;
  items_pending_review: number;
  created_at: Date;
  updated_at: Date;
  error_message: string | null;
}

async function createUploadSession(
  userId: string,
  imageCount: number
): Promise<CreateUploadSessionResponse> {
  if (imageCount < 1 || imageCount > 10) {
    const error = new Error('Image count must be between 1 and 10');
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_IMAGE_COUNT';
    throw error;
  }

  const uploadResult = await db.query(
    `INSERT INTO uploads (user_id, status, image_count, processed_count)
     VALUES ($1, 'uploading', $2, 0)
     RETURNING *`,
    [userId, imageCount]
  );

  const upload = uploadResult.rows[0];
  const signedUrls: SignedUrl[] = [];

  for (let i = 0; i < imageCount; i++) {
    const imageId = randomUUID();
    const s3Key = `uploads/${userId}/${upload.id}/${imageId}.jpg`;

    await db.query(
      `INSERT INTO upload_images (id, upload_id, s3_key, s3_url, status)
       VALUES ($1, $2, $3, $4, 'uploaded')`,
      [imageId, upload.id, s3Key, `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`]
    );

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      ContentType: 'image/jpeg',
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    signedUrls.push({
      image_id: imageId,
      url: signedUrl,
      s3_key: s3Key,
    });
  }

  return {
    upload_id: upload.id,
    signed_urls: signedUrls,
  };
}

async function completeUpload(uploadId: string, userId: string): Promise<{ status: string }> {
  console.log;
  const result = await db.query('SELECT * FROM uploads WHERE id = $1', [uploadId]);

  if (result.rows.length === 0) {
    const error = new Error('Upload not found');
    (error as any).statusCode = 404;
    (error as any).code = 'UPLOAD_NOT_FOUND';
    throw error;
  }

  const upload = result.rows[0];

  if (upload.user_id !== userId) {
    const error = new Error('Upload belongs to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  if (upload.status !== 'uploading') {
    const error = new Error('Upload is not in uploading state');
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_STATE';
    throw error;
  }

  // Change to 'uploaded' state - worker will transition to 'processing'
  await db.query(
    `UPDATE uploads SET status = 'uploaded', updated_at = NOW()
     WHERE id = $1`,
    [uploadId]
  );

  return { status: 'uploaded' };
}

async function getUploadStatus(uploadId: string, userId: string): Promise<UploadStatusResponse> {
  const result = await db.query('SELECT * FROM uploads WHERE id = $1', [uploadId]);

  if (result.rows.length === 0) {
    const error = new Error('Upload not found');
    (error as any).statusCode = 404;
    (error as any).code = 'UPLOAD_NOT_FOUND';
    throw error;
  }

  const upload = result.rows[0];

  if (upload.user_id !== userId) {
    const error = new Error('Upload belongs to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  const pendingResult = await db.query(
    `SELECT COUNT(*) as count FROM clothing_items
     WHERE user_id = $1 AND status = 'pending_review'
     AND upload_image_id IN (
       SELECT id FROM upload_images WHERE upload_id = $2
     )`,
    [userId, uploadId]
  );

  return {
    upload_id: upload.id,
    status: upload.status,
    image_count: upload.image_count,
    processed_count: upload.processed_count,
    items_pending_review: parseInt(pendingResult.rows[0].count),
    created_at: upload.created_at,
    updated_at: upload.updated_at,
    error_message: upload.error_message,
  };
}

export default {
  createUploadSession,
  completeUpload,
  getUploadStatus,
};
