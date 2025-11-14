import { Response, NextFunction } from 'express';
import { ApiError, AuthRequest } from '../types';

function errorHandler(error: ApiError, req: AuthRequest, res: Response, _next: NextFunction): void {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    user: req.user?.id,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;

  res.status(statusCode).json({
    error: {
      message: message,
      code: error.code || 'INTERNAL_ERROR',
    },
  });
}

export default errorHandler;
