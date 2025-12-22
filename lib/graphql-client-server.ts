// Server-side GraphQL client utility
// This file is for server components and API routes only
'use server'

import { auth } from '@clerk/nextjs/server';
import { GraphQLClient } from './graphql-client';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

// Server-side GraphQL request helper (for API routes and server components)
export async function serverGraphQLRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  const client = new GraphQLClient(GRAPHQL_ENDPOINT);
  return client.request<T>(query, variables, token);
}

