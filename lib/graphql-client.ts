// GraphQL client utility for making requests to the backend
// This file is used by client components, so it cannot import server-only modules

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || GRAPHQL_ENDPOINT;
  }

  async request<T = any>(
    query: string,
    variables?: Record<string, any>,
    token?: string | null
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e) => e.message).join(', ');
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return result.data;
    } catch (error: any) {
      console.error('GraphQL request error:', error);
      throw error;
    }
  }
}

// Client-side GraphQL request helper
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  token?: string | null
): Promise<T> {
  const client = new GraphQLClient();
  return client.request<T>(query, variables, token);
}

