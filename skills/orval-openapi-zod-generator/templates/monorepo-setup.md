# Monorepo Setup for Orval + Zod

In a modern monorepo (Turborepo, Nx, or pnpm workspaces), managing API contracts across multiple packages is critical. This guide outlines the best practices for sharing Orval-generated code.

## Recommended Architecture

```text
.
├── apps/
│   ├── web/               # Next.js / Vite app
│   └── mobile/            # React Native app
└── packages/
    ├── api-spec/          # Source of truth (OpenAPI YAML/JSON)
    └── api-client/        # Shared generated client + Zod schemas
```

## Step 1: `packages/api-spec`

Keep your OpenAPI specification in a dedicated package. This allows it to be versioned independently.

```json
// packages/api-spec/package.json
{
  "name": "@my-org/api-spec",
  "version": "1.0.0",
  "exports": {
    "./openapi.yaml": "./openapi.yaml"
  }
}
```

## Step 2: `packages/api-client`

This package handles the generation. It depends on `@my-org/api-spec`.

### orval.config.ts

```typescript
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../api-spec/openapi.yaml',
    output: {
      target: './src/index.ts',
      schemas: './src/model',
      client: 'react-query',
      mode: 'split',
      override: {
        zod: true
      }
    }
  }
});
```

### package.json scripts

```json
{
  "name": "@my-org/api-client",
  "scripts": {
    "generate": "orval",
    "build": "tsup src/index.ts --format esm,cjs --dts"
  },
  "devDependencies": {
    "orval": "^8.0.0",
    "tsup": "^8.0.0"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.0.0"
  }
}
```

## Step 3: Consumption in `apps/web`

Install your shared client:

```bash
pnpm add @my-org/api-client --filter web
```

Usage:

```typescript
import { useGetPets } from '@my-org/api-client';
import { petSchema } from '@my-org/api-client/zod'; // If split

const { data } = useGetPets();
```

## Benefits

1. **DRY**: Generate once, use everywhere.
2. **Consistency**: Both Web and Mobile use the exact same Zod validation.
3. **CI/CD**: One place to run validation and generation.
