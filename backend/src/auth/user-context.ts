import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from './clerk';

// Use singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export interface UserContext {
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  profileImage?: string;
}

// Get or create user from Clerk authentication
export const getUserContext = async (req: any): Promise<UserContext | null> => {
  try {
    const clerkUser = getUserFromRequest(req);
    if (!clerkUser || !clerkUser.clerkId) {
      return null;
    }

    // Find existing user or create new one
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.clerkId }
    });

    if (!user) {
      // Create new user
      try {
        user = await prisma.user.create({
          data: {
            clerkId: clerkUser.clerkId,
            email: clerkUser.email || '',
            name: clerkUser.name || 'User',
            profileImage: clerkUser.profileImage,
          }
        });
      } catch (createError: any) {
        // If creation fails (e.g., duplicate email), try to find by email
        if (createError.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { email: clerkUser.email }
          });
          
          // If found by email but clerkId doesn't match, update it
          if (user && user.clerkId !== clerkUser.clerkId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { clerkId: clerkUser.clerkId }
            });
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Update existing user info if needed
      // IMPORTANT: Don't update profileImage from Clerk if user has uploaded their own
      // Only use Clerk's image as fallback when user.profileImage is null/empty
      const needsUpdate = 
        user.email !== clerkUser.email || 
        user.name !== clerkUser.name;

      if (needsUpdate) {
        // Determine profileImage: use existing if it exists and is not empty, otherwise use Clerk's
        const profileImageToUse = user.profileImage && user.profileImage.trim().length > 0
          ? user.profileImage  // Keep user's uploaded image
          : (clerkUser.profileImage || user.profileImage); // Fallback to Clerk only if user hasn't uploaded
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: clerkUser.email || user.email,
            name: clerkUser.name || user.name,
            profileImage: profileImageToUse,
          }
        });
      }
    }

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage || undefined,
    };
  } catch (error: any) {
    console.error('❌ Error getting user context:', error?.message || error);
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
      console.error('💡 Database connection failed. Check your DATABASE_URL in backend/.env');
      console.error('💡 For Neon databases, make sure the URL includes ?sslmode=require');
    }
    return null;
  }
};

// Middleware to inject user context into GraphQL context
export const userContextMiddleware = async (req: any, res: any, next: any) => {
  try {
    const userContext = await getUserContext(req);
    req.userContext = userContext;
    next();
  } catch (error) {
    console.error('Error in user context middleware:', error);
    req.userContext = null;
    next();
  }
};




