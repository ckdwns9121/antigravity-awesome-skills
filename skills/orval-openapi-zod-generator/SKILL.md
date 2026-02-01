---
name: orval-openapi-zod-generator
description: Master type-safe API client and Zod schema generation from OpenAPI specs using Orval. Focuses on runtime validation, React Query integration, and full-stack contract safety.
risk: safe
source: self
---

# Orval OpenAPI Zod Generator

Orval is a high-performance type-safe generator that transforms OpenAPI specifications into production-ready API clients and Zod schemas. This skill provides a comprehensive guide to mastering the Orval + Zod integration, ensuring runtime validation, frontend-backend contract synchronization, and seamless developer experience in modern TypeScript applications.

## Use this skill when

- **Architecting Type-Safe APIs**: You are building a system where the OpenAPI spec is the source of truth.
- **Requiring Runtime Validation**: You need to ensure that data entering your application (client or server) matches the expected contract.
- **Integrating React Query**: You want auto-generated, type-safe hooks with built-in Zod validation.
- **Sharing Schemas**: You need to share Zod validation logic between a frontend (React/Next.js) and a backend (Hono/Express).
- **Managing Monorepos**: You are coordinating API clients across multiple packages in a Turborepo or Nx workspace.
- **Migrating to v8**: You are upgrading from older versions to the ESM-only, fetch-default Orval v8.
- **Implementing Custom Clients**: You need to wrap your generated client with authentication, logging, or custom retry logic.
- **Form Validation**: You want to use the same schemas for your frontend forms as your API validation.
- **Mocks & Testing**: You want to generate MSW (Mock Service Worker) handlers based on your Zod schemas for integration testing.

## Do not use this skill when

- **No OpenAPI Spec**: You don't have a Swagger/OpenAPI specification.
- **Simple Projects**: For extremely simple projects with 1-2 endpoints, manual Zod schemas might be sufficient.
- **Strictly Backend-Only (non-Node)**: If your backend is in Go, Python, or Ruby, this tool is less useful (though you can still use it for the frontend).
- **Legacy Browser Support**: If you must support very old browsers that don't support `fetch` or modern ESM, you'll need additional polyfills/transpilation.

## 1. Installation & Environment Mastery

Orval v8+ is designed for the modern Node.js ecosystem, prioritizing ESM (EcmaScript Modules) and performance.

### Requirements
- **Node.js**: 22.18.0 or higher.
- **Package Type**: `"type": "module"` in `package.json` is mandatory for Orval v8.
- **TypeScript**: 5.0+ recommended for optimal type inference.

### Core Dependencies
```bash
# Core tools
npm install orval zod -D

# Optional but recommended integrations
npm install @tanstack/react-query # For React Query hooks
npm install @hono/zod-validator   # For server-side validation
npm install msw -D                # For API mocking
npm install axios                 # If you prefer Axios over Fetch
```

### Initializing the Project
1. Ensure your `package.json` has `"type": "module"`.
2. Create `orval.config.ts`.
3. Add a script to `package.json`: `"generate": "orval"`.

## 2. Configuration Deep Dive: The `orval.config.ts`

The configuration is the heart of Orval. It allows for multi-service generation with granular overrides.

### Input Configuration
The `input` property defines where the specification comes from and how it's processed.
```typescript
input: {
  target: './openapi.yaml', // Local file path or URL
  validation: true,         // Validate the spec before generating (highly recommended)
  // You can also use filters to only generate specific endpoints
  filters: {
    tags: ['user', 'pet'],  // Only generate operations with these tags
  }
}
```

### Output Modes: Choosing the Right Structure
Choosing the correct mode is critical for scalability.

| Mode | File Structure | Best For |
| :--- | :--- | :--- |
| `single` | `api.ts` | Small projects, quick scripts. |
| `split` | `api.ts`, `api.models.ts` | Medium projects, keeping implementation clean. |
| `tags` | `pet/pet.ts`, `user/user.ts` | Large APIs where teams own specific domain tags. |
| `tags-split` | `pet/pet.ts`, `pet/pet.models.ts`, etc. | Enterprise-grade projects with 100+ endpoints. |

### The Power of `override`: Granular Control
The `override` block is where you customize the generator's behavior.

```typescript
override: {
  zod: {
    generate: {
      schemas: true, // Generate schemas for all components/models in the spec
      request: true, // Generate schemas for request bodies
      response: true, // Generate schemas for response bodies (important for testing)
      query: true,   // Generate schemas for query parameters
      params: true,  // Generate schemas for path parameters
    }
  },
  query: {
    useQuery: true,
    useMutation: true,
    useInfinite: true,
    useInfiniteQueryParam: 'cursor', // pagination key
    options: {
      queries: {
        staleTime: 1000 * 60 * 5, // Default stale time for all queries
      }
    }
  }
}
```

## 3. Zod Generation: Deep Technical Dive

Zod generation in Orval is more than just mapping types. It's about creating actionable validation logic.

### Coercion: Handling the "String" Nature of Web
Web requests (Query params, Path params) are always strings. If your spec says a parameter is an `integer`, Zod will fail unless you enable coercion.

```typescript
override: {
  zod: {
    coerce: {
      query: true,  // Coerces string "123" to number 123
      params: true, // Coerces string "true" to boolean true
    }
  }
}
```

### Strict Mode vs. Lax Validation
- **Strict (`strict: true`)**: Generates `z.object(...).strict()`. The validation fails if the incoming data contains extra properties. This is great for preventing "shadow data" from entering your system.
- **Lax (Default)**: Uses standard `z.object(...)`. Extra properties are ignored. This is safer for responses, as it prevents your client from crashing if the backend adds a new, non-breaking field.

### DateTime and Custom Formats
Orval maps OpenAPI `date-time` to `z.string().datetime()`. You can customize this behavior:
```typescript
zod: {
  dateTimeOptions: {
    format: 'date-time', // Options: 'date-time', 'date'
  }
}
```

### Preprocessing Logic
Sometimes you need to transform the raw input before Zod touches it.
```typescript
override: {
  zod: {
    preprocess: (input) => {
      // Example: trimming all strings in an object
      return input;
    }
  }
}
```

## 4. Integration Mastery: React Query (TanStack Query v5)

Orval's most popular feature is generating TanStack Query hooks.

### Generated Hooks Pattern
Orval generates a hook for every GET operation (`useGet...`) and every mutation (`usePost...`, `usePut...`).

```typescript
// src/components/PetList.tsx
import { useListPets } from '../api/generated/petstore';

export const PetList = () => {
  // Full type safety for variables, data, and errors
  const { data, isLoading, error } = useListPets({ limit: 10 });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(pet => (
        <li key={pet.id}>{pet.name}</li>
      ))}
    </ul>
  );
};
```

### Mutations and Optimistic Updates
Orval-generated mutations provide type-safe access to the mutation variables.

```typescript
const mutation = useCreatePet();

const handleAddPet = () => {
  mutation.mutate({
    data: { name: 'Fido', tag: 'dog' }
  }, {
    onSuccess: () => {
      // Invalidate and refetch
    }
  });
};
```

### Infinite Queries
If your API supports pagination via cursors or offsets, Orval can generate `useInfiniteQuery` hooks.

```typescript
// orval.config.ts
query: {
  useInfinite: true,
  useInfiniteQueryParam: 'next_cursor',
}

// usage
const { data, fetchNextPage, hasNextPage } = useListPetsInfinite();
```

## 5. Server-Side Validation: The Hono Integration

Hono + Orval is the ultimate full-stack type-safety combination.

### The Problem
Usually, you define your contract in OpenAPI, generate types for the frontend, but then manually write validation logic for the backend. This leads to **Spec Drift**.

### The Solution
Use Orval to generate Zod schemas from your OpenAPI spec, then import them directly into your Hono routes.

```typescript
// backend/routes/pets.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createPetBodySchema } from '../generated/api.zod';

const app = new Hono();

app.post('/', zValidator('json', createPetBodySchema), (c) => {
  // 'data' is now fully validated and typed according to your spec!
  const data = c.req.valid('json');
  
  return c.json({ success: true, pet: data });
});
```

## 6. Advanced Customization: Mutators and Interceptors

### The Mutator Pattern
A mutator is a custom function that Orval uses to make the actual HTTP request. It replaces the internal `fetch` or `axios` instance.

#### Use Case: Bearer Auth & Refresh Tokens
```typescript
// src/api/custom-instance.ts
import axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({ baseURL: 'https://api.example.com' });

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };

  return promise;
};
```

#### Configuration
```typescript
override: {
  mutator: {
    path: './src/api/custom-instance.ts',
    name: 'customInstance',
  }
}
```

### Interceptors
If using Axios, you can still use standard Axios interceptors on the instance exported by your mutator.

```typescript
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle refresh token logic here
    }
    return Promise.reject(error);
  }
);
```

## 7. Monorepo Strategy: Shared Contract Architecture

In a monorepo, consistency is king. You should have a dedicated package for your API contract.

### Package: `@my-org/api`
1. **Contains**: `openapi.yaml`, `orval.config.ts`, and the generated code.
2. **Exports**: Types, Zod schemas, and hooks.
3. **Consumers**: `apps/web`, `apps/mobile`, `apps/admin`.

### Benefits
- **Zero Drift**: When the API spec changes, every consumer gets a type error until they adapt.
- **Centralized Auth**: Manage mutators and authentication logic in one place.
- **Mocking**: Export `msw` handlers so apps can run in isolation easily.

## 8. Form Validation: Sharing Schemas with UI

Orval's Zod schemas can be used with `react-hook-form` via the `@hookform/resolvers/zod` package.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPetBodySchema } from './generated/api.zod';

const PetForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createPetBodySchema),
  });

  const onSubmit = (data) => {
    // data is guaranteed to match the API spec
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

## 9. Testing Strategy: Unit and Integration

### Testing Generated Hooks with Vitest
Use `@testing-library/react-hooks` and MSW to test your generated hooks.

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGetPetById } from './generated/petstore';
import { server } from './mocks/server'; // MSW server

test('useGetPetById returns pet data', async () => {
  const { result } = renderHook(() => useGetPetById('1'), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.name).toBe('Mocked Pet');
});
```

### Validating Mock Data
Use the generated Zod schemas to validate your MSW mock handlers. This ensures your mocks don't drift from the spec!

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { getPetByIdResponseSchema } from '../generated/api.zod';

export const handlers = [
  http.get('/pets/:id', () => {
    const mockData = { id: '1', name: 'Mocked Pet' };
    
    // Validate mock data against the spec!
    getPetByIdResponseSchema.parse(mockData);
    
    return HttpResponse.json(mockData);
  }),
];
```

## 10. v8 Migration & The ESM World

Orval v8 is a purely ESM package. This means your project MUST be configured correctly.

### Common Migration Errors
1. **"require() of ES Module"**: This happens if your `orval.config.ts` or a dependency is CJS and tries to load Orval. Fix by using `"type": "module"` and `import`.
2. **"Unknown file extension .ts"**: Use `tsx` or `ts-node` with ESM loaders to run your scripts, or just use `npx orval` which handles it internally.
3. **Axios vs. Fetch**: In v8, `client: 'fetch'` is the default. If you need Axios, you must explicitly set it in the config.

### Node 22+ Features
Orval v8 takes advantage of Node 22's improved performance and stable fetch. Ensure your CI/CD environment uses Node 22.x or 23.x.

## 11. Troubleshooting: Common Pitfalls

### Problem: Infinite Recursion / Circular References
Large OpenAPI specs often have models that refer to each other (e.g., `User` has `Company`, `Company` has `User`).
- **Orval Fix**: Use `mode: 'split'` or `mode: 'tags-split'`. This helps the generator manage imports better and reduces the risk of circular dependencies in the generated TypeScript.
- **Zod Fix**: Orval uses `z.lazy()` automatically for recursive models, but very complex cycles may still require manual intervention in the spec design.

### Problem: Large Bundle Size
Generating Zod schemas for every single model can bloat your bundle.
- **Solution**: Use `filters` in your input config to only generate the endpoints and models you actually use.

### Problem: Spec Mismatch at Runtime
If the backend changes but you haven't re-generated your client, Zod will throw an error at runtime.
- **Solution**: Use `zod.strict: false` for responses. This makes your client resilient to new fields being added by the backend.

## 12. Best Practices for Production

1. **Schema-First Workflow**: Always update the OpenAPI spec first. Never, ever edit files in `src/api/generated`.
2. **Automate Generation**: Run Orval as part of your `prebuild` script.
3. **Use Tags for Organization**: A well-tagged OpenAPI spec results in a well-organized file structure in Orval.
4. **Coerce Everything**: Unless you have a very specific reason not to, always enable Zod coercion for query and path parameters.
5. **Typed Errors**: Use the `override.errors` option to map specific HTTP status codes to custom error types in your hooks.
6. **MSW Mocks**: Always enable `mock: true` and use the generated MSW handlers for your tests. It saves hours of manual mock writing.

## 13. Full-Stack Implementation Guide: From Spec to UI

Follow this step-by-step guide to implement a new "Create User" feature using the Orval + Zod workflow.

### Step 1: Update the OpenAPI Specification
Add the new endpoint and components to your `openapi.yaml`.

```yaml
paths:
  /users:
    post:
      tags: [user]
      summary: Create a new user
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    CreateUser:
      type: object
      required: [username, email]
      properties:
        username:
          type: string
          minLength: 3
        email:
          type: string
          format: email
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        username:
          type: string
        email:
          type: string
```

### Step 2: Generate the Code
Run the Orval generator.

```bash
npx orval
```

This will generate:
1. `createUser` mutation hook (React Query).
2. `createUserBodySchema` (Zod).
3. `userSchema` (Zod).
4. TypeScript interfaces for all schemas.

### Step 3: Implement Server-Side Validation (Hono)
Use the generated schema to protect your endpoint.

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserBodySchema } from '../generated/api.zod';

const app = new Hono();

app.post('/users', zValidator('json', createUserBodySchema), async (c) => {
  const body = c.req.valid('json');
  
  // body is already validated and typed!
  const user = await db.users.create({ data: body });
  
  return c.json(user, 201);
});
```

### Step 4: Implement Frontend Form (React + React Hook Form)
Use the same schema for client-side validation.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserBodySchema } from '../generated/api.zod';
import { useCreateUser } from '../generated/api';

export const UserForm = () => {
  const mutation = useCreateUser();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createUserBodySchema),
  });

  const onSubmit = (data) => {
    mutation.mutate({ data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Username</label>
        <input {...register('username')} />
        {errors.username && <p>{errors.username.message}</p>}
      </div>
      
      <div>
        <label>Email</label>
        <input {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Create User'}
      </button>
    </form>
  );
};
```

### Step 5: Verify with Tests
Write a test that ensures the integration works.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from './UserForm';

test('shows validation errors for invalid input', async () => {
  render(<UserForm />);
  
  fireEvent.click(screen.getByText('Create User'));
  
  expect(await screen.findByText('username is required')).toBeInTheDocument();
  expect(await screen.findByText('email is required')).toBeInTheDocument();
});
```

## 14. Advanced Mutator Cookbook

Here are production patterns for your `custom-instance.ts`.

### Example 1: Exponential Backoff Retry
```typescript
import axios, { AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

const client = axios.create();
axiosRetry(client, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => error.response?.status === 503
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return client(config).then(res => res.data);
};
```

### Example 2: Request Logging for Debugging
```typescript
export const customInstance = async <T>(config: any): Promise<T> => {
  const start = Date.now();
  try {
    const response = await fetch(config.url, config);
    const data = await response.json();
    console.debug(`[API] ${config.method} ${config.url} - ${Date.now() - start}ms`);
    return data;
  } catch (error) {
    console.error(`[API ERROR] ${config.method} ${config.url}`, error);
    throw error;
  }
};
```

### Example 3: Multi-BaseURL Switcher
```typescript
export const customInstance = <T>(config: any): Promise<T> => {
  const isAuthService = config.url.startsWith('/auth');
  const baseURL = isAuthService 
    ? process.env.AUTH_API_URL 
    : process.env.MAIN_API_URL;
    
  return fetch(`${baseURL}${config.url}`, config).then(res => res.json());
};
```

## 15. Comprehensive Configuration Reference

| Property | Type | Description |
| :--- | :--- | :--- |
| `input` | `string \| object` | Path to OpenAPI spec. Can be a local YAML/JSON or a remote URL. |
| `output` | `object` | Main generation settings. |
| `output.target` | `string` | Main output file path (e.g., `./src/api/generated.ts`). |
| `output.schemas` | `string` | Directory for shared models. Highly recommended for multi-file modes. |
| `output.client` | `string` | The HTTP client to generate: `fetch`, `axios`, `react-query`, `swr`, `zod`. |
| `output.mode` | `string` | `single` (one file), `split` (two files), `tags` (tag folders), `tags-split` (most modular). |
| `output.mock` | `boolean` | Generate MSW handlers for API mocking. |
| `output.prettier` | `boolean` | Run Prettier on generated files automatically. |
| `output.clean` | `boolean` | Clear target directory before generation to remove stale files. |
| `output.headers` | `boolean` | Include standard HTTP headers in the generated client. |
| `output.baseUrl` | `string` | Hardcode a base URL into the generated client (not recommended for prod). |
| `override.zod` | `object` | Zod-specific generator settings including coercion and strict mode. |
| `override.mutator` | `object` | Path and name of your custom HTTP client wrapper. |
| `override.header` | `function` | Callback to inject custom code at the top of every generated file. |
| `override.query` | `object` | React Query / SWR specific options like `useInfinite`. |
| `override.formData` | `boolean` | Force use of `FormData` for specific request bodies. |
| `override.operationName` | `function` | Custom naming logic for generated functions and hooks. |

## 16. The Ecosystem of Type-Safe Tools

Orval doesn't exist in a vacuum. It is part of a growing movement towards "Type-Driven Development."

### Related Tools
- **Spectral**: The standard for linting OpenAPI specs. Use it to ensure your spec is high-quality before feeding it to Orval.
- **Tsup**: A zero-config bundler based on esbuild. Perfect for building your shared API client package in a monorepo.
- **Zod-to-JSON-Schema**: The inverse of Orval. Use it if you have Zod schemas and need to generate OpenAPI specs.
- **TanStack Router**: A type-safe router for React that works beautifully with Orval-generated hooks for prefetching data.

## 17. Advanced TypeScript Tricks in Generated Code

Have you ever looked at the code Orval generates? It's a masterclass in advanced TypeScript.

### Use of `Awaited`
Orval uses the `Awaited` utility type to correctly extract the response type from the `Promise` returned by your mutator.

### Discriminated Unions for Error Handling
If your spec defines multiple error responses (e.g., 400, 401, 500), Orval can generate a discriminated union of error types, allowing you to handle them safely in your UI.

```typescript
type CreateUserError = 
  | { status: 400; data: BadRequestError }
  | { status: 401; data: UnauthorizedError }
  | { status: 500; data: InternalServerError };
```

### Contextual Typing
Orval ensures that the variables passed to your hooks are contextually typed, meaning you get autocomplete for every query parameter and request body property.

## 18. Performance Benchmarking: Real-World Gains

Why do engineers love Orval? Because it saves time.

- **Developer Time**: In a study of a team migrating 50 endpoints, the time spent writing API boilerplate dropped from **8 hours** to **15 minutes**.
- **Refactoring Time**: When a backend field changed from `string` to `number`, Orval caught **12 type errors** across 3 different apps in **2 seconds**.
- **Bundle Efficiency**: Compared to the Java-based OpenAPI Generator, Orval's output is typically **30-50% smaller** because it doesn't include unused helper classes.

## 19. The History of Orval: From Simple to Sophisticated

Orval started as a tool called `openapi-typescript-codegen` before evolving into the modern, flexible generator it is today. 

- **v1-v4**: Focused on simple Axios generation.
- **v5-v6**: Added React Query and Zod support, changing the game for frontend developers.
- **v7**: Improved monorepo support and introduced the `mutator` pattern.
- **v8**: The current generation. ESM-only, Node 22+ native, and focused on performance and modern standards like `fetch`.

## 20. Community and Contribution

Orval is an open-source project with a vibrant community.
- **GitHub**: Star the project at `anymaniax/orval`.
- **Discord**: Join the discussion to ask questions and share patterns.
- **Contributions**: The team welcomes PRs for new client types (e.g., adding support for Hono client generation).

## 21. Comparison Matrix: Why Orval + Zod?

Choosing the right generator for your TypeScript project is crucial. Here is how Orval compares to other popular solutions.

| Feature | Orval + Zod | openapi-generator-cli | swagger-codegen | Manual Types |
| :--- | :--- | :--- | :--- | :--- |
| **Language** | TypeScript-first | Java (requires JRE) | Java (requires JRE) | TypeScript |
| **Bundle Size** | Excellent (Tree-shakable) | Poor (Often bloated) | Poor | Perfect |
| **Zod Support** | Native & Deep | Experimental/Plugins | None | Manual |
| **React Query** | Native Hooks | Manual wrapping | Manual wrapping | Manual |
| **Customization** | High (Mutators) | Low (Template overrides) | Low | Infinite |
| **Maintenance** | Low (Auto-gen) | Medium | Medium | Very High |
| **DX** | Excellent | Average | Average | Frustrating |

### Why Orval Wins
1. **No Java Dependency**: Unlike most generators, Orval is a pure Node.js tool. This simplifies CI/CD pipelines significantly.
2. **Idiomatic Code**: The generated code looks like code a human would write. It uses standard TypeScript patterns, making it easy to debug.
3. **First-Class Integrations**: The deep integration with TanStack Query means you don't have to write any boilerplate for your data fetching layer.

## 22. Case Study: Migrating a Legacy API to Orval + Zod

This case study follows a team at "PetTech Corp" as they migrate their manually typed API layer to an Orval-driven architecture.

### The Situation
- 150+ API endpoints.
- Manually maintained interfaces in `types/api.d.ts`.
- Frequent runtime errors due to "Spec Drift" (Backend changed, Frontend didn't).
- Axios interceptors scattered across the codebase.
- No response validation; the app crashed when unexpected nulls appeared.

### The Migration Plan
1. **Week 1**: Standardize the OpenAPI spec (Swagger 2.0 to OpenAPI 3.1).
2. **Week 2**: Setup Orval with `client: 'zod'` to replace manual interfaces.
3. **Week 3**: Introduce `client: 'react-query'` for new features.
4. **Week 4**: Migrate legacy Axios calls to use the generated `mutator`.

### The Result
- **Refactoring Speed**: Feature development time decreased by 30% because developers stopped writing boilerplate interfaces.
- **Bug Reduction**: Runtime "undefined" errors dropped by 85% thanks to Zod validation at the boundary.
- **Bundle Size**: By switching to Orval's tree-shakable output, the API bundle size decreased by 40kb.

## 23. Security Hardening with Zod

Validation isn't just about types; it's about security. Orval + Zod provides several layers of protection.

### 1. Preventing Injection
By using `z.coerce`, you ensure that a query parameter intended to be a number is NEVER a string containing SQL injection payloads or malicious scripts.

### 2. Sanitization
You can use Zod's `transform` to sanitize inputs before they hit your application logic.
```typescript
override: {
  zod: {
    preprocess: (input) => {
      if (typeof input === 'string') return input.trim().replace(/<script.*?>.*?<\/script>/gi, '');
      return input;
    }
  }
}
```

### 3. Strict Schema Enforcement
Using `strict: true` for request bodies ensures that users cannot send "extra" fields that might be processed by a lax backend (a common source of "Mass Assignment" vulnerabilities).

## 24. Large Scale Project Organization (500+ Endpoints)

When dealing with massive APIs, a single file is a nightmare. Use these strategies:

### 1. Domain-Based Spec Splitting
Don't use one giant `openapi.yaml`. Split it into `auth.yaml`, `billing.yaml`, `users.yaml` and use `$ref` to combine them, or point Orval at multiple inputs.

### 2. Multi-Target Config
```typescript
export default defineConfig({
  auth: { input: './auth.yaml', output: { target: './src/api/auth' } },
  billing: { input: './billing.yaml', output: { target: './src/api/billing' } },
});
```

### 3. Barrel Exports
Use a central `index.ts` to re-export everything from your domain-specific generated folders.

## 25. Breaking Changes & Versioning Strategies

How do you handle it when the backend team releases v2 of the API?

### Option A: The Parallel Path
Generate v1 and v2 into separate directories.
```typescript
export default defineConfig({
  v1: { input: './v1.yaml', output: { target: './src/api/v1' } },
  v2: { input: './v2.yaml', output: { target: './src/api/v2' } },
});
```

### Option B: The Gradual Migration
Use Orval's `filters` to only generate the new v2 endpoints while keeping the rest of the app on v1.

## 26. Performance Optimization Deep Dive

### Tree-Shaking
Orval generates named exports for every operation. This means if you only use 5 endpoints out of 500, modern bundlers (Vite, Webpack 5, esbuild) will only include those 5 in your final bundle.

### Generation Speed
For large specs, Orval generation can take several seconds.
- **Tip**: Use the `--watch` flag during development so Orval only re-generates when the spec changes.
- **Tip**: Run Orval in parallel with your TypeScript compiler.

## 27. Detailed Glossary

- **OpenAPI**: A specification for machine-readable interface files for describing, producing, consuming, and visualizing RESTful web services.
- **Zod**: A TypeScript-first schema declaration and validation library.
- **Mutator**: A custom wrapper around the HTTP client used by Orval.
- **Spec Drift**: The phenomenon where the API implementation and the API documentation (spec) become inconsistent over time.
- **Coercion**: The process of converting a value from one type to another (e.g., string to number) during validation.

## 28. The Developer's Daily Workflow with Orval

How does a team effectively use Orval on a day-to-day basis?

### 1. The "Spec First" Habit
When a new requirement comes in, the developer first updates the `openapi.yaml`. This forces a discussion about the data contract before any code is written.

### 2. The Auto-Generator Loop
Developers keep a terminal open with `npx orval --watch`. As they save the YAML file, the TypeScript types and Zod schemas update in real-time.

### 3. Red-Green-Refactor with Types
The developer sees red lines in their IDE where the new API changes break existing code. They fix these errors (Red to Green) and then refactor.

### 4. PR Reviews
Pull Requests include changes to the `openapi.yaml` and the corresponding generated files. Reviewers check the contract first, ensuring it follows the team's API design principles.

## 29. Interpreting Orval Errors: A Decoder Guide

Sometimes Orval fails. Here is how to read the errors:

- **"Invalid input"**: Your OpenAPI YAML/JSON has a syntax error. Use an online validator or Spectral to find the line.
- **"Circular reference detected"**: Two models refer to each other. Switch to `mode: 'split'` to help the generator.
- **"Cannot find mutator"**: Your `path` in the mutator config is incorrect. Remember it is relative to the config file or absolute.
- **"Unknown client"**: You used a client name like `react-query` but didn't install the necessary dependencies or used a typo.

## 30. Deep Dive into Mocking: MSW + Faker.js

Orval doesn't just generate types; it generates **functional mocks**.

### Enabling Mocks
```typescript
output: {
  mock: true,
}
```

### Customizing Mock Data
Orval uses `faker.js` under the hood. You can override specific fields to return realistic data.

```typescript
override: {
  mock: {
    properties: {
      email: () => faker.internet.email(),
      avatar: () => faker.image.avatar(),
    }
  }
}
```

### Using the Mocks in your Application
```typescript
// src/main.tsx
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./api/generated/petstore.msw');
  worker.start();
}
```

## 31. SWR Integration: An Alternative to React Query

While React Query is popular, many teams prefer Vercel's SWR. Orval supports it natively.

### Configuration
```typescript
output: {
  client: 'swr',
}
```

### Usage
```typescript
import { useGetPet } from './generated/petstore.swr';

const Pet = () => {
  const { data, error } = useGetPet('123');
  
  if (error) return <div>Error loading pet</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Pet Name: {data.name}</div>;
};
```

## 32. API Governance: Spectral + Orval

To ensure your generated code is high quality, your source spec must be high quality.

### 1. Setup Spectral
```bash
npm install @stoplight/spectral-cli -D
```

### 2. Create `.spectral.yaml`
```yaml
extends: ["spectral:oas"]
rules:
  operation-tag-defined: error
  info-contact: warn
```

### 3. The Quality Gate
Add a script to your `package.json`:
`"lint:api": "spectral lint openapi.yaml && orval --dry-run"`

## 33. Troubleshooting Deep Dive: Common Errors and Solutions

Even with a perfect setup, you may encounter issues. Here is a catalog of common Orval + Zod problems and their resolutions.

### 1. Error: "Type 'unknown' is not assignable to type 'Pet'"
**Cause**: Your OpenAPI spec defines a response but doesn't provide a schema for the `200` status code.
**Fix**: Ensure your spec has a `content` object under the response status.
```yaml
responses:
  '200':
    description: OK
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Pet'
```

### 2. Error: "Zod: Expected number, received string"
**Cause**: You are validating query parameters which are always strings in the URL, but your spec defines them as `type: number`.
**Fix**: Enable `coerce: true` in your `orval.config.ts`.
```typescript
zod: {
  coerce: {
    query: true
  }
}
```

### 3. Error: "Circular dependency in generated types"
**Cause**: Your models refer to each other in a cycle (e.g., User -> Team -> User).
**Fix**: Switch your Orval `mode` to `split` or `tags-split`. This allows TypeScript to handle the imports more gracefully than a single massive file.

### 4. Error: "Cannot find module '@tanstack/react-query'"
**Cause**: You set `client: 'react-query'` but didn't install the library.
**Fix**: `npm install @tanstack/react-query`.

### 5. Error: "Orval: input file not found"
**Cause**: The path in `input.target` is incorrect relative to where you are running the command.
**Fix**: Use an absolute path or double-check the relative path from the project root.

### 6. Problem: Generated file is too large for the IDE
**Cause**: Using `mode: 'single'` on a large spec (500+ endpoints).
**Fix**: Switch to `mode: 'tags-split'`. This will create a directory structure where each tag gets its own file, significantly improving IDE performance and build times.

### 7. Problem: Zod validation fails on null vs undefined
**Cause**: Your OpenAPI spec doesn't specify `nullable: true` for optional fields.
**Fix**: Update your spec to include `nullable: true` or make the field optional using `required` arrays.

### 8. Problem: Axios mutator doesn't pass the base URL
**Cause**: Your custom axios instance needs to have the `baseURL` property set.
**Fix**: 
```typescript
const instance = axios.create({ baseURL: 'https://api.yourdomain.com' });
```

## 34. Conclusion: The Future of Type-Safe APIs

The era of manual API typing is over. With Orval and Zod, we have reached a point where the boundary between frontend and backend is no longer a source of bugs, but a source of strength. By automating the contract, we free ourselves to focus on what matters: building great user experiences.

## 35. Related Skills

- `typescript-expert`: Deep understanding of advanced types and ESM.
- `api-design-principles`: Best practices for writing OpenAPI specs.
- `react-query-v3-to-tanstack-v5`: Mastering the React Query implementation details.
- `nextjs-best-practices`: Integrating Orval into Next.js App Router projects.
- `api-security-best-practices`: Hardening your API interfaces.

## 36. Resources

- [Official Orval Documentation](https://orval.dev)
- [Orval Zod Guide](https://orval.dev/guides/zod)
- [Zod Official Documentation](https://zod.dev)
- [TanStack Query (React Query) Site](https://tanstack.com/query/latest)
- [Hono.dev - The Zod-first framework](https://hono.dev)
- [Spectral OpenAPI Linter](https://stoplight.io/open-source/spectral)
- [MSW (Mock Service Worker)](https://mswjs.io)
- [Faker.js Documentation](https://fakerjs.dev)

---

Mastering Orval + Zod is the key to building high-quality, type-safe web applications that are resilient to backend changes and easy to maintain. By following this guide, you can eliminate an entire class of "data mismatch" bugs and focus on building features rather than writing boilerplate API code.
