import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import db from '../config/database';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

async function verifyGoogleToken(token: string): Promise<GoogleUserData> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return {
      email: payload?.email || '',
      name: payload?.name || '',
      picture: payload?.picture || '',
      googleId: payload?.sub || '',
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

async function findOrCreateUser(googleUserData: GoogleUserData): Promise<User> {
  // Check if user exists
  const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [
    googleUserData.email,
  ]);

  if (existingUser.rows.length > 0) {
    return existingUser.rows[0];
  }

  // Create new user
  const newUser = await db.query(
    `INSERT INTO users (email, name, picture, google_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [googleUserData.email, googleUserData.name, googleUserData.picture, googleUserData.googleId]
  );

  return newUser.rows[0];
}

function generateJWT(user: User): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId: user.id, email: user.email }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export default {
  verifyGoogleToken,
  findOrCreateUser,
  generateJWT,
};
