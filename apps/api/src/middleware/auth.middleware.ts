import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';

// Extended Request interface to include user data
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// JWT Secret from environment
const JWT_SECRET = getJwtSecret();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Attach user to request
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'student',
      name: decoded.name || decoded.full_name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work with or without auth
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'student',
      name: decoded.name || decoded.full_name,
    };
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth failed:', error);
  }

  next();
};

/**
 * Helper function to generate JWT token
 */
export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
  name: string;
}) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: '24h', // Token expires in 24 hours
    },
  );
};

/**
 * Helper function to refresh token
 */
export const refreshToken = (oldToken: string) => {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET, {
      ignoreExpiration: true,
    }) as any;

    return generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });
  } catch (error) {
    throw new Error('Invalid token for refresh');
  }
};

export default {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  generateToken,
  refreshToken,
};
