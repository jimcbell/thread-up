import db from '../config/database';
import getSignedImageUrl from '../services/s3Service';
import { analyzeWithOpenAI } from '../services/aiServices';

async function processUpload(uploadRecord: any): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`📸 Processing upload ${uploadRecord.id}`);

  const imagesResult = await db.query(
    `SELECT * FROM upload_images
     WHERE upload_id = $1 AND status = 'uploaded'`,
    [uploadRecord.id]
  );

  const images = imagesResult.rows;
  let successCount = 0;
  let failCount = 0;

  for (const image of images) {
    try {
      await db.query(`UPDATE upload_images SET status = 'processing' WHERE id = $1`, [image.id]);

      // Generate a signed URL for OpenAI to access the image
      const signedUrl = await getSignedImageUrl(image.s3_key);

      const analysis = await analyzeWithOpenAI(signedUrl);

      await db.query(
        `INSERT INTO clothing_items
         (user_id, upload_image_id, s3_key, s3_url, category, colors, pattern, formality_level, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_review')`,
        [
          uploadRecord.user_id,
          image.id,
          image.s3_key,
          image.s3_url,
          analysis.category,
          JSON.stringify(analysis.colors),
          analysis.pattern,
          analysis.formality_level,
        ]
      );

      await db.query(`UPDATE upload_images SET status = 'analyzed' WHERE id = $1`, [image.id]);

      successCount++;
      // eslint-disable-next-line no-console
      console.log(`✅ Image ${image.id} analyzed: ${analysis.category}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`❌ Error processing image ${image.id}:`, (error as Error).message);

      await db.query(
        `UPDATE upload_images
         SET status = 'error', error_message = $1
         WHERE id = $2`,
        [(error as Error).message, image.id]
      );

      failCount++;
    }
  }

  const finalStatus = successCount > 0 ? 'ready_for_review' : 'error';
  await db.query(
    `UPDATE uploads
     SET status = $1, processed_count = $2, updated_at = NOW()
     WHERE id = $3`,
    [finalStatus, successCount, uploadRecord.id]
  );

  // eslint-disable-next-line no-console
  console.log(
    `✨ Upload ${uploadRecord.id} complete: ${successCount} success, ${failCount} failed`
  );
}

export async function uploadProcessingWorker(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('🚀 Upload processing worker started');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const result = await db.query(
        `SELECT * FROM uploads
         WHERE status = 'uploaded'
         ORDER BY created_at ASC
         LIMIT 1`
      );

      if (result.rows.length > 0) {
        const uploadRecord = result.rows[0];
        // Transition to 'processing' to mark we're working on it
        await db.query(`UPDATE uploads SET status = 'processing' WHERE id = $1`, [uploadRecord.id]);
        await processUpload(uploadRecord);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Worker error:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
