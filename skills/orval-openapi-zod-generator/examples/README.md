# Orval + Zod Examples

This directory contains practical, production-ready examples of using Orval with Zod validation.

## Examples Breakdown

### 1. [Basic Configuration](./basic-config.ts)
A simple setup for generating pure Zod schemas from an OpenAPI specification. Ideal for projects that only need runtime validation without a full API client.

### 2. [React Query with Zod Validation](./react-query-with-zod.ts)
A dual configuration that generates both TanStack Query hooks and Zod validation schemas. This represents the gold standard for type-safe frontend development.

### 3. [Hono Server Validation](./hono-server-validation.ts)
Demonstrates how to use generated Zod schemas on the server-side with Hono to validate incoming requests (JSON bodies, query parameters, etc.).

### 4. [Custom Mutator with Auth](./custom-mutator.ts)
A complex example showing how to implement a custom HTTP client (mutator) with authentication headers and error handling, while keeping the generated code clean.

## How to use these examples

1. Copy the desired configuration into your `orval.config.ts`.
2. Ensure you have the necessary dependencies installed (`orval`, `zod`, etc.).
3. Run `npx orval` to generate the code.
4. Import the generated schemas/hooks into your application.
