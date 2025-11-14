import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import logger from '../utils/logger';

interface GoogleLoginRequest extends Request {
  body: {
    token: string;
  };
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
}

// Story 1.1: Google OAuth Integration
async function googleLogin(
  req: GoogleLoginRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      logger.warn('❌ Missing Google token in login request');
      const error = new Error('Google token is required');
      (error as any).statusCode = 400;
      (error as any).code = 'MISSING_TOKEN';
      throw error;
    }

    logger.info('🔐 Google login attempt');

    // Verify Google token
    const googleUserData = await authService.verifyGoogleToken(googleToken);
    logger.debug('✅ Google token verified', { email: googleUserData.email });

    // Find or create user
    const user = await authService.findOrCreateUser(googleUserData);
    logger.info('👤 User found/created', { userId: user.id, email: user.email });

    // Generate JWT
    const token = authService.generateJWT(user);
    logger.info('🔑 JWT generated', { userId: user.id });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      token,
    });
  } catch (error) {
    logger.error('🚫 Google login failed', error as Error);
    if ((error as Error).message === 'Invalid Google token') {
      (error as any).statusCode = 401;
      (error as any).code = 'INVALID_GOOGLE_TOKEN';
    }
    next(error);
  }
}

// Story 1.3: Get Current User
async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // User is already attached to req by auth middleware
    logger.debug('📋 Get current user', { userId: req.user.id });
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    });
  } catch (error) {
    logger.error('❌ Get current user failed', error as Error);
    next(error);
  }
}

export default {
  googleLogin,
  getCurrentUser,
};
