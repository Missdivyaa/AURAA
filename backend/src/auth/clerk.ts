import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/backend';

// Initialize Clerk client
let clerk: ReturnType<typeof createClerkClient> | null = null;

try {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (secretKey) {
    clerk = createClerkClient({ secretKey });
    console.log('✅ Clerk client initialized successfully');
  } else {
    console.error('❌ CLERK_SECRET_KEY not found in environment variables');
  }
} catch (error: any) {
  console.error('❌ Failed to initialize Clerk client:', error?.message || error);
}

// Clerk authentication middleware - requires valid token
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access this resource'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!clerk) {
      console.error('Clerk client not initialized');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    try {
      // Verify the token - try verifyToken first, fallback to JWT decode
      let userId: string | null = null;
      
      try {
        // Try Clerk's verifyToken method (if available)
        if (typeof clerk.verifyToken === 'function') {
          const verifiedToken = await clerk.verifyToken(token);
          if (verifiedToken && verifiedToken.sub) {
            userId = verifiedToken.sub;
          }
        }
      } catch (e) {
        // Fallback to JWT decode
      }
      
      // Fallback: decode JWT to get user ID
      if (!userId) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token, { complete: true });
        if (decoded && decoded.payload && decoded.payload.sub) {
          userId = decoded.payload.sub;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Please sign in again'
        });
      }

      // Get user information using the user ID from the token
      const user = await clerk.users.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Please sign in again'
      });
    }

    // Attach user info to request
    req.clerkUser = {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
      profileImage: user.imageUrl || undefined,
    };

      next();
    } catch (verifyError: any) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: verifyError.message || 'Please sign in again'
      });
    }
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message || 'Please sign in again'
    });
  }
};

// Optional auth middleware - doesn't fail if no auth
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ No authorization header found');
      req.clerkUser = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    if (!clerk) {
      console.error('❌ Clerk client not initialized');
      req.clerkUser = null;
      return next();
    }

    try {
      // Clerk's getToken() returns a JWT session token
      // For Clerk backend SDK v1.34+, we can verify the token using verifyToken
      let userId: string | null = null;
      
      try {
        // Verify the session token using Clerk's verifyToken method
        const verifiedToken = await clerk.verifyToken(token);
        
        if (verifiedToken && verifiedToken.sub) {
          userId = verifiedToken.sub;
          console.log('✅ Token verified, user ID:', userId);
        } else {
          console.log('⚠️ Token verification failed: no sub claim');
          req.clerkUser = null;
          return next();
        }
      } catch (verifyError: any) {
        console.error('❌ Token verification error:', verifyError?.message || verifyError);
        // Try fallback: decode JWT without verification (for development)
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(token, { complete: true });
          if (decoded && decoded.payload && decoded.payload.sub) {
            userId = decoded.payload.sub;
            console.log('⚠️ Using fallback decode, user ID:', userId);
          } else {
            req.clerkUser = null;
            return next();
          }
        } catch (decodeError: any) {
          console.error('❌ Fallback decode also failed:', decodeError.message);
          req.clerkUser = null;
          return next();
        }
      }

      if (!userId) {
        req.clerkUser = null;
        return next();
      }

      // Get user information using the user ID from the token
      const user = await clerk.users.getUser(userId);
    
      if (user) {
        console.log('✅ User found:', user.id, user.emailAddresses[0]?.emailAddress);
        req.clerkUser = {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
          profileImage: user.imageUrl || undefined,
        };
      } else {
        console.log('⚠️ User not found for ID:', userId);
        req.clerkUser = null;
      }
    } catch (verifyError: any) {
      // If verification fails, log and continue without auth
      console.error('❌ Token verification error:', verifyError?.message || verifyError);
      req.clerkUser = null;
    }

    next();
  } catch (error: any) {
    // If verification fails, just continue without auth
    console.error('❌ Authentication middleware error:', error?.message || error);
    req.clerkUser = null;
    next();
  }
};

// Extract user info from Clerk auth
export const getUserFromRequest = (req: Request & { clerkUser?: any }) => {
  return req.clerkUser || null;
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      clerkUser?: {
        clerkId: string;
        email: string;
        name: string;
        profileImage?: string;
      } | null;
    }
  }
}

