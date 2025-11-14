import { Response, NextFunction } from 'express';
import outfitService from '../services/outfitService';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

async function generateOutfits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { occasion } = req.body;
    logger.info('✨ Generate outfits', { userId: req.user.id, occasion });
    const result = await outfitService.generateOutfits(req.user.id, occasion);
    logger.info('✅ Outfits generated', { userId: req.user.id, occasion });
    res.json(result);
  } catch (error) {
    logger.error('❌ Generate outfits failed', error as Error);
    next(error);
  }
}

async function saveOutfit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { occasion, item_ids } = req.body;
    logger.info('💾 Save outfit', { userId: req.user.id, occasion, itemCount: item_ids?.length });
    const result = await outfitService.saveOutfit(req.user.id, occasion, item_ids);
    logger.info('✅ Outfit saved', { userId: req.user.id, occasion });
    res.json(result);
  } catch (error) {
    logger.error('❌ Save outfit failed', error as Error);
    next(error);
  }
}

async function getSavedOutfits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('📚 Get saved outfits', { userId: req.user.id });
    const outfits = await outfitService.getSavedOutfits(req.user.id);
    logger.info('✅ Saved outfits retrieved', { userId: req.user.id, count: outfits.length });
    res.json(outfits);
  } catch (error) {
    logger.error('❌ Get saved outfits failed', error as Error);
    next(error);
  }
}

async function deleteOutfit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('🗑️  Delete outfit', { outfitId: req.params.id, userId: req.user.id });
    const result = await outfitService.deleteOutfit(req.params.id, req.user.id);
    logger.info('✅ Outfit deleted', { outfitId: req.params.id });
    res.json(result);
  } catch (error) {
    logger.error('❌ Delete outfit failed', error as Error);
    next(error);
  }
}

export default {
  generateOutfits,
  saveOutfit,
  getSavedOutfits,
  deleteOutfit,
};
