import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

function requestLogger(req: AuthRequest, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        userId: req.user?.id || 'anonymous',
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      })
    );
  });

  next();
}

export default requestLogger;
