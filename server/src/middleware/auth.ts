import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { AuthRequest, User } from '../types';

interface JWTPayload {
  userId: string;
  email: string;
}

async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const result = await db.query<User>(
      'SELECT id, email, name, picture FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        error: {
          message: 'Invalid token - user not found',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
}

export default authenticateToken;
