import db from '../config/database';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/aws';
import { Category, Pattern, FormalityLevel, ItemStatus, ClothingItemUpdate } from '../types';

const VALID_CATEGORIES: Category[] = ['top', 'bottom', 'dress', 'shoes', 'outerwear'];
const VALID_PATTERNS: Pattern[] = ['solid', 'striped', 'floral', 'plaid', 'printed', 'other'];
const VALID_FORMALITY: FormalityLevel[] = ['casual', 'business_casual', 'formal'];
const VALID_STATUSES: ItemStatus[] = ['pending_review', 'approved', 'rejected'];

async function generateSignedUrl(s3Key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    console.log(s3Key);
    // Generate signed URL with 1 hour expiration for viewing
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating signed URL:', (error as Error).message);
    throw error;
  }
}

interface PendingItem {
  id: string;
  s3_url: string;
  category: Category;
  colors: string[];
  pattern: Pattern;
  formality_level: FormalityLevel;
  created_at: Date;
}

interface UpdateResponse {
  success: boolean;
  item: any;
}

async function getPendingItems(userId: string): Promise<PendingItem[]> {
  const result = await db.query(
    `SELECT * FROM clothing_items
     WHERE user_id = $1 AND status = 'pending_review'
     ORDER BY created_at DESC`,
    [userId]
  );

  const items = await Promise.all(
    result.rows.map(async (item: any) => ({
      id: item.id,
      s3_url: item.s3_url,
      signed_url: await generateSignedUrl(item.s3_key),
      category: item.category,
      colors: item.colors,
      pattern: item.pattern,
      formality_level: item.formality_level,
      created_at: item.created_at,
    }))
  );

  return items;
}

async function updateClothingItem(
  itemId: string,
  userId: string,
  updates: ClothingItemUpdate
): Promise<UpdateResponse> {
  const itemResult = await db.query('SELECT * FROM clothing_items WHERE id = $1', [itemId]);

  if (itemResult.rows.length === 0) {
    const error = new Error('Item not found');
    (error as any).statusCode = 404;
    (error as any).code = 'ITEM_NOT_FOUND';
    throw error;
  }

  if (itemResult.rows[0].user_id !== userId) {
    const error = new Error('Item belongs to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  if (updates.category && !VALID_CATEGORIES.includes(updates.category)) {
    const error = new Error(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_CATEGORY';
    throw error;
  }

  if (updates.pattern && !VALID_PATTERNS.includes(updates.pattern)) {
    const error = new Error(`Invalid pattern. Must be one of: ${VALID_PATTERNS.join(', ')}`);
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_PATTERN';
    throw error;
  }

  if (updates.formality_level && !VALID_FORMALITY.includes(updates.formality_level)) {
    const error = new Error(
      `Invalid formality level. Must be one of: ${VALID_FORMALITY.join(', ')}`
    );
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_FORMALITY';
    throw error;
  }

  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    const error = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_STATUS';
    throw error;
  }

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }
  if (updates.colors !== undefined) {
    fields.push(`colors = $${paramIndex++}`);
    values.push(JSON.stringify(updates.colors));
  }
  if (updates.pattern !== undefined) {
    fields.push(`pattern = $${paramIndex++}`);
    values.push(updates.pattern);
  }
  if (updates.formality_level !== undefined) {
    fields.push(`formality_level = $${paramIndex++}`);
    values.push(updates.formality_level);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }

  if (fields.length === 0) {
    return {
      success: true,
      item: itemResult.rows[0],
    };
  }

  fields.push(`updated_at = NOW()`);
  values.push(itemId);

  const query = `
    UPDATE clothing_items
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);
  const item = result.rows[0];
  const signed_url = await generateSignedUrl(item.s3_key);

  return {
    success: true,
    item: {
      ...item,
      signed_url,
    },
  };
}

async function getWardrobe(userId: string, category?: string | null): Promise<any[]> {
  let query = `
    SELECT * FROM clothing_items
    WHERE user_id = $1 AND status = 'approved'
  `;
  const params: any[] = [userId];

  if (category) {
    if (!VALID_CATEGORIES.includes(category as Category)) {
      const error = new Error('Invalid category');
      (error as any).statusCode = 400;
      (error as any).code = 'INVALID_CATEGORY';
      throw error;
    }
    query += ' AND category = $2';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  const result = await db.query(query, params);

  const items = await Promise.all(
    result.rows.map(async (item: any) => ({
      ...item,
      signed_url: await generateSignedUrl(item.s3_key),
    }))
  );

  return items;
}

async function deleteClothingItem(itemId: string, userId: string): Promise<{ success: boolean }> {
  const itemResult = await db.query('SELECT * FROM clothing_items WHERE id = $1', [itemId]);

  if (itemResult.rows.length === 0) {
    const error = new Error('Item not found');
    (error as any).statusCode = 404;
    (error as any).code = 'ITEM_NOT_FOUND';
    throw error;
  }

  if (itemResult.rows[0].user_id !== userId) {
    const error = new Error('Item belongs to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  await db.query('DELETE FROM clothing_items WHERE id = $1', [itemId]);

  return { success: true };
}

export default {
  getPendingItems,
  updateClothingItem,
  getWardrobe,
  deleteClothingItem,
};
