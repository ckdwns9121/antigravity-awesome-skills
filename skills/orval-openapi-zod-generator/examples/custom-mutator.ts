import { defineConfig } from 'orval';

/**
 * Custom Mutator configuration.
 * Mutators allow you to override the default HTTP client (fetch/axios)
 * to add custom logic like:
 * - Bearer token injection
 * - Refresh token handling
 * - Request/Response logging
 * - Base URL management
 */

// 1. The Orval Configuration
export default defineConfig({
  petstore: {
    input: './petstore.yaml',
    output: {
      target: './src/api/generated/petstore.ts',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});

// 2. The Implementation (Save this in src/api/custom-instance.ts)
/*
export const customInstance = <T>(
  config: { 
    url: string; 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; 
    params?: any; 
    data?: any; 
    headers?: any 
  }
): Promise<T> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.petstore.io';
  
  return fetch(`${API_URL}${config.url}${config.params ? '?' + new URLSearchParams(config.params) : ''}`, {
    method: config.method,
    headers: {
      ...config.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Network response was not ok');
    }
    return response.json();
  });
};
*/
