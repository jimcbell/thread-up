import { OpenAI } from 'openai';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import db from '../config/database';
import { s3Client, S3_BUCKET } from '../config/aws';
import { AIAnalysis } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIResponse {
  category: string;
  colors: string[];
  pattern: string;
  formality_level: string;
}

async function getSignedImageUrl(s3Key: string): Promise<string> {
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

async function analyzeWithOpenAI(imageUrl: string): Promise<AIAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this clothing item and return ONLY a JSON object with these exact fields:
{
  "category": "top" | "bottom" | "dress" | "shoes" | "outerwear",
  "colors": ["color1", "color2"],
  "pattern": "solid" | "striped" | "floral" | "plaid" | "printed" | "other",
  "formality_level": "casual" | "business_casual" | "formal"
}

Rules:
- category: Choose the most appropriate single category
- colors: List up to 3 dominant colors (use common color names)
- pattern: If multiple patterns, choose the most prominent
- formality_level: Consider typical wear context

Return ONLY the JSON, no other text.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    let content = response.choices[0].message.content || '';

    content = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed: AIResponse = JSON.parse(content);

    if (!parsed.category || !parsed.colors || !parsed.pattern || !parsed.formality_level) {
      throw new Error('Invalid AI response - missing required fields');
    }

    return {
      category: parsed.category as any,
      colors: parsed.colors,
      pattern: parsed.pattern as any,
      formality_level: parsed.formality_level as any,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('OpenAI analysis error:', (error as Error).message);
    throw error;
  }
}

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
