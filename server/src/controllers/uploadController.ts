import { Response, NextFunction } from 'express';
import uploadService from '../services/uploadService';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

async function startUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { file_count } = req.body;
    logger.info('📤 Start upload request', { userId: req.user.id, fileCount: file_count });

    if (!file_count) {
      logger.warn('❌ Missing file_count in request body', { userId: req.user.id });
      res.status(400).json({ error: 'file_count is required' });
      return;
    }

    const result = await uploadService.createUploadSession(req.user.id, file_count);
    logger.info('✅ Upload session created', { uploadId: result.upload_id, fileCount: file_count });
    res.json(result);
  } catch (error) {
    logger.error('❌ Start upload failed', error as Error);
    next(error);
  }
}

async function completeUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uploadId = req.params.id;
    logger.info('✔️  Complete upload request', { uploadId, userId: req.user.id });

    const result = await uploadService.completeUpload(uploadId, req.user.id);
    logger.info('✅ Upload completed', { uploadId, newStatus: result.status });
    res.json(result);
  } catch (error) {
    logger.error('❌ Complete upload failed', error as Error);
    next(error);
  }
}

async function getUploadStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const uploadId = req.params.id;
    logger.debug('📊 Get upload status request', { uploadId, userId: req.user.id });

    const result = await uploadService.getUploadStatus(uploadId, req.user.id);
    logger.debug('📊 Upload status retrieved', { uploadId, status: result.status });
    res.json(result);
  } catch (error) {
    logger.error('❌ Get upload status failed', error as Error);
    next(error);
  }
}

export default {
  startUpload,
  completeUpload,
  getUploadStatus,
};
