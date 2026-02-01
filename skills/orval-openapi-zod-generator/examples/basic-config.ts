import { defineConfig } from 'orval';

/**
 * Basic Orval configuration for generating pure Zod schemas.
 * Use this when you want to handle the HTTP layer yourself or
 * use schemas for form validation (e.g., with react-hook-form).
 */
export default defineConfig({
  petstore: {
    input: {
      target: './petstore.yaml',
      // You can also provide a URL
      // target: 'https://petstore.swagger.io/v2/swagger.json',
    },
    output: {
      mode: 'split',
      target: './src/api/petstore.ts',
      client: 'zod',
      override: {
        zod: {
          generate: {
            schemas: true,
            request: true,
            response: true,
          },
          strict: {
            query: true,
            params: true,
          },
          coerce: {
            query: true,
          },
        },
      },
    },
  },
});
