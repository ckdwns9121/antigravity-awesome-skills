import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Example: Basic useQuery Migration
 * Shows the evolution from v3 to v5
 */

// =============================================================================
// v3 - Multiple argument syntax
// =============================================================================

// v3: Three separate arguments
function UserProfile_v3({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery(
    ['user', userId],           // queryKey
    () => fetchUser(userId),    // queryFn
    {                           // options
      staleTime: 1000 * 60,
      cacheTime: 1000 * 60 * 5,
    }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.name}</div>
}

// =============================================================================
// v4 - Object syntax (after codemod)
// =============================================================================

function UserProfile_v4({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5, // Renamed from cacheTime
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.name}</div>
}

// =============================================================================
// v5 - Better naming and type inference
// =============================================================================

// Define typed fetcher function
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

interface User {
  id: number
  name: string
  email: string
}

function UserProfile_v5({ userId }: { userId: number }) {
  // Type is inferred from fetchUser return type
  const { data, isPending, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })

  // Note: isPending instead of isLoading
  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // TypeScript knows data is User | undefined
  return <div>{data?.name}</div>
}

// =============================================================================
// v5 - With TypeScript strict mode
// =============================================================================

function UserProfile_v5_Strict({ userId }: { userId: number }) {
  const { data, isPending, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null // Explicit check for TypeScript

  // Now data is User (not undefined)
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
}

// =============================================================================
// Migration Helper: Automated refactor pattern
// =============================================================================

/**
 * Before running codemod:
 * 
 * 1. Update imports:
 *    - Change 'react-query' to '@tanstack/react-query'
 * 
 * 2. Run codemod:
 *    npx jscodeshift ./src \
 *      --extensions=ts,tsx \
 *      --parser=tsx \
 *      --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
 * 
 * 3. Find & Replace:
 *    - cacheTime → gcTime
 *    - isLoading → isPending (where appropriate)
 */

// =============================================================================
// Export for testing
// =============================================================================

export {
  UserProfile_v3,
  UserProfile_v4,
  UserProfile_v5,
  UserProfile_v5_Strict,
}
