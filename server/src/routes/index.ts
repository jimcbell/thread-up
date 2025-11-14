import express, { Router, Response } from 'express';
import authController from '../controllers/authController';
import uploadController from '../controllers/uploadController';
import clothingController from '../controllers/clothingController';
import outfitController from '../controllers/outfitController';
import authenticateToken from '../middleware/auth';

const router: Router = express.Router();

// Health check
router.get('/health', (_, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/google', authController.googleLogin as any);
router.get('/auth/me', authenticateToken, authController.getCurrentUser as any);

// Upload routes
router.post('/uploads/start', authenticateToken, uploadController.startUpload as any);
router.post('/uploads/:id/complete', authenticateToken, uploadController.completeUpload as any);
router.get('/uploads/:id/status', authenticateToken, uploadController.getUploadStatus as any);

// Clothing items routes
router.get('/clothing-items/pending', authenticateToken, clothingController.getPendingItems as any);
router.patch('/clothing-items/:id', authenticateToken, clothingController.updateItem as any);
router.delete('/clothing-items/:id', authenticateToken, clothingController.deleteItem as any);

// Wardrobe routes
router.get('/wardrobe', authenticateToken, clothingController.getWardrobe as any);

// Outfit routes
router.post('/outfits/generate', authenticateToken, outfitController.generateOutfits as any);
router.post('/outfits', authenticateToken, outfitController.saveOutfit as any);
router.get('/outfits', authenticateToken, outfitController.getSavedOutfits as any);
router.delete('/outfits/:id', authenticateToken, outfitController.deleteOutfit as any);

export default router;
