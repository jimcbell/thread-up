import db from '../config/database';
import { Occasion, OutfitItem } from '../types';
import { generateOutfitWithOpenAI } from './aiServices';
import getSignedImageUrl from './s3Service';

const OCCASION_FORMALITY_MAP: Record<string, 'casual' | 'business_casual' | 'formal'> = {
  casual_friday: 'business_casual',
  date_night: 'business_casual',
  business_meeting: 'formal',
  weekend_casual: 'casual',
};

// const NEUTRAL_COLORS = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown', 'tan', 'cream'];

// function colorsMatch(colors1: string[], colors2: string[]): boolean {
//   const allColors = [...colors1, ...colors2].map((c) => c.toLowerCase());

//   if (allColors.some((c) => NEUTRAL_COLORS.includes(c))) {
//     return true;
//   }

//   if (colors1.some((c) => colors2.map((c2) => c2.toLowerCase()).includes(c.toLowerCase()))) {
//     return true;
//   }

//   return false;
// }

// interface GeneratedOutfit {
//   items: {
//     top?: OutfitItem | null;
//     bottom?: OutfitItem | null;
//     dress?: OutfitItem | null;
//     shoes?: OutfitItem | null;
//   };
// }

interface OutfitsResponse {
  itemIds: string[];
}

interface SaveOutfitResponse {
  success: boolean;
  outfit_id: string;
}

interface SavedOutfitResponse {
  id: string;
  occasion: Occasion;
  items: Record<string, OutfitItem | null>;
  created_at: Date;
}

function formatItem(item: any): OutfitItem {
  return {
    id: item.id,
    s3_url: item.s3_url,
    category: item.category,
    colors: item.colors,
    pattern: item.pattern,
  };
}

async function generateOutfits(userId: string, occasion: Occasion): Promise<OutfitsResponse> {
  console.log(userId, occasion);
  if (!OCCASION_FORMALITY_MAP[occasion]) {
    const error = new Error('Invalid occasion');
    (error as any).statusCode = 400;
    (error as any).code = 'INVALID_OCCASION';
    throw error;
  }

  const result = await db.query(
    `SELECT * FROM clothing_items
     WHERE user_id = $1 AND status = 'approved'`,
    [userId]
  );

  const wardrobe = result.rows;
  console.log(wardrobe);
  const imageUrls = await Promise.all(
    wardrobe.map(async (item: any) => ({
      imageUrl: await getSignedImageUrl(item.s3_key),
      id: item.id,
    }))
  );

  console.log(imageUrls);

  const itemIds = await generateOutfitWithOpenAI(occasion, imageUrls);

  console.log(itemIds);
  return { itemIds };
}

async function saveOutfit(
  userId: string,
  occasion: Occasion,
  itemIds: Record<string, string>
): Promise<SaveOutfitResponse> {
  const itemIdsArray = Object.values(itemIds);

  const result = await db.query(`SELECT id, user_id FROM clothing_items WHERE id = ANY($1)`, [
    itemIdsArray,
  ]);

  if (result.rows.length !== itemIdsArray.length) {
    const error = new Error('One or more items not found');
    (error as any).statusCode = 404;
    (error as any).code = 'ITEMS_NOT_FOUND';
    throw error;
  }

  if (result.rows.some((item: any) => item.user_id !== userId)) {
    const error = new Error('Items belong to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  const outfitResult = await db.query(
    `INSERT INTO outfits (user_id, occasion, item_ids)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, occasion, JSON.stringify(itemIds)]
  );

  return {
    success: true,
    outfit_id: outfitResult.rows[0].id,
  };
}

async function getSavedOutfits(userId: string): Promise<SavedOutfitResponse[]> {
  const result = await db.query(
    `SELECT * FROM outfits WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  const outfits: SavedOutfitResponse[] = [];

  for (const outfit of result.rows) {
    const itemIds = Object.values(outfit.item_ids);

    const itemsResult = await db.query(`SELECT * FROM clothing_items WHERE id = ANY($1)`, [
      itemIds,
    ]);

    const itemsMap: Record<string, OutfitItem> = {};
    itemsResult.rows.forEach((item: any) => {
      itemsMap[item.id] = formatItem(item);
    });

    const items: Record<string, OutfitItem | null> = {};
    Object.entries(outfit.item_ids).forEach(([key, id]: [string, any]) => {
      items[key] = itemsMap[id] || null;
    });

    outfits.push({
      id: outfit.id,
      occasion: outfit.occasion,
      items,
      created_at: outfit.created_at,
    });
  }

  return outfits;
}

async function deleteOutfit(outfitId: string, userId: string): Promise<{ success: boolean }> {
  const result = await db.query('SELECT * FROM outfits WHERE id = $1', [outfitId]);

  if (result.rows.length === 0) {
    const error = new Error('Outfit not found');
    (error as any).statusCode = 404;
    (error as any).code = 'OUTFIT_NOT_FOUND';
    throw error;
  }

  if (result.rows[0].user_id !== userId) {
    const error = new Error('Outfit belongs to different user');
    (error as any).statusCode = 403;
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  await db.query('DELETE FROM outfits WHERE id = $1', [outfitId]);

  return { success: true };
}

export default {
  generateOutfits,
  saveOutfit,
  getSavedOutfits,
  deleteOutfit,
};
