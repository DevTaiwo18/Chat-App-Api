import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "chatapp24434";
const JWT_EXPIRES_IN = '24h';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};