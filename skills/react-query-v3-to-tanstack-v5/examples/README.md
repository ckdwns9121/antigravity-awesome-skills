# Migration Examples

This folder contains real-world code examples showing before/after patterns for migrating from React Query v3 to TanStack Query v5.

## Examples

### `basic-query-migration.tsx`
Demonstrates the most common migration pattern: simple `useQuery` calls.

**Covers:**
- Object syntax conversion
- Import updates
- Type inference improvements

### `mutation-migration.tsx`
Shows how to migrate mutations and handle side effects without deprecated callbacks.

**Covers:**
- `useMutation` signature changes
- Moving from callbacks to promise-based patterns
- Cache invalidation strategies

### `suspense-migration.tsx`
Illustrates migrating from `suspense: true` flag to dedicated `useSuspenseQuery` hooks.

**Covers:**
- `useSuspenseQuery` vs `useQuery`
- TypeScript type safety improvements
- Error boundary integration

### `infinite-scroll-migration.tsx`
Complete example of migrating infinite queries with the new `initialPageParam` requirement.

**Covers:**
- `useInfiniteQuery` changes
- Pagination logic
- Loading states

## Usage

Each file contains:
1. **v3 code** (commented with `// v3`)
2. **v4 code** (commented with `// v4`)
3. **v5 code** (commented with `// v5`)

You can compare versions side-by-side to understand the evolution.

## Running Examples

```bash
# These are TypeScript snippets, not runnable apps
# Copy patterns into your actual migration
```

## Learn More

- [Main SKILL.md](../SKILL.md) - Complete migration guide
- [TanStack Query Docs](https://tanstack.com/query/v5)
