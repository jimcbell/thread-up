import { Response, NextFunction } from 'express';
import clothingService from '../services/clothingService';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

async function getPendingItems(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('📋 Get pending items', { userId: req.user.id });
    const items = await clothingService.getPendingItems(req.user.id);
    logger.info('✅ Pending items retrieved', { userId: req.user.id, count: items.length });
    res.json(items);
  } catch (error) {
    logger.error('❌ Get pending items failed', error as Error);
    next(error);
  }
}

async function updateItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('✏️  Update clothing item', { itemId: req.params.id, userId: req.user.id });
    const result = await clothingService.updateClothingItem(req.params.id, req.user.id, req.body);
    logger.info('✅ Clothing item updated', { itemId: req.params.id });
    res.json(result);
  } catch (error) {
    logger.error('❌ Update item failed', error as Error);
    next(error);
  }
}

async function deleteItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('🗑️  Delete clothing item', { itemId: req.params.id, userId: req.user.id });
    const result = await clothingService.deleteClothingItem(req.params.id, req.user.id);
    logger.info('✅ Clothing item deleted', { itemId: req.params.id });
    res.json(result);
  } catch (error) {
    logger.error('❌ Delete item failed', error as Error);
    next(error);
  }
}

async function getWardrobe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const category = req.query.category as string | undefined;
    logger.info('👕 Get wardrobe', { userId: req.user.id, category: category || 'all' });
    const items = await clothingService.getWardrobe(req.user.id, category);
    logger.info('✅ Wardrobe retrieved', { userId: req.user.id, count: items.length });
    res.json(items);
  } catch (error) {
    logger.error('❌ Get wardrobe failed', error as Error);
    next(error);
  }
}

export default {
  getPendingItems,
  updateItem,
  deleteItem,
  getWardrobe,
};
