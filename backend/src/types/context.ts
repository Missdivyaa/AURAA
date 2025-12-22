import { UserContext } from '../auth/user-context';

export interface GraphQLContext {
  userContext: UserContext | null;
}

export interface AuthenticatedContext extends GraphQLContext {
  userContext: UserContext;
}

export const requireAuth = (context: GraphQLContext): AuthenticatedContext => {
  if (!context.userContext) {
    throw new Error('Authentication required');
  }
  return context as AuthenticatedContext;
};

export const optionalAuth = (context: GraphQLContext): GraphQLContext => {
  return context;
};




