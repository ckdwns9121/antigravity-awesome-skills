import { defineConfig } from 'orval';

/**
 * Production-ready configuration for React Query + Zod.
 * This setup generates:
 * 1. TanStack Query hooks (useQuery, useMutation)
 * 2. Zod schemas for runtime validation
 * 3. Dedicated .zod.ts file for schemas to keep imports clean
 */
export default defineConfig({
  petstore: {
    input: './petstore.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      mock: true, // Generate MSW mocks as well!
      override: {
        zod: true, // Enable Zod generation
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'next_cursor',
        },
      },
    },
  },
  // Separate Zod-only target for sharing schemas across packages
  petstoreZod: {
    input: './petstore.yaml',
    output: {
      target: './src/api/generated/petstore.zod.ts',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
});
