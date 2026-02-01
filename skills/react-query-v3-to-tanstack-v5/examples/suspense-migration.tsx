import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

/**
 * Example: Suspense Migration
 * Shows migration from suspense flag to dedicated hooks
 */

interface Post {
  id: number
  title: string
  content: string
}

async function fetchPost(postId: number): Promise<Post> {
  const response = await fetch(`/api/posts/${postId}`)
  if (!response.ok) throw new Error('Failed to fetch post')
  return response.json()
}

// =============================================================================
// v4 - Using suspense flag
// =============================================================================

function PostDetails_v4({ postId }: { postId: number }) {
  const { data } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    suspense: true, // ❌ Deprecated in v5
  })

  // TypeScript still thinks data might be undefined
  return (
    <article>
      <h1>{data?.title}</h1>
      <p>{data?.content}</p>
    </article>
  )
}

// Wrap with Suspense in parent
function App_v4() {
  return (
    <Suspense fallback={<div>Loading post...</div>}>
      <PostDetails_v4 postId={1} />
    </Suspense>
  )
}

// =============================================================================
// v5 - Using useSuspenseQuery hook
// =============================================================================

function PostDetails_v5({ postId }: { postId: number }) {
  const { data } = useSuspenseQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  // TypeScript knows data is Post (never undefined!)
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  )
}

// Wrap with Suspense in parent (same as v4)
function App_v5() {
  return (
    <Suspense fallback={<div>Loading post...</div>}>
      <PostDetails_v5 postId={1} />
    </Suspense>
  )
}

// =============================================================================
// v5 - With Error Boundary
// =============================================================================

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App_v5_WithErrorBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>Loading post...</div>}>
        <PostDetails_v5 postId={1} />
      </Suspense>
    </ErrorBoundary>
  )
}

// =============================================================================
// v5 - Multiple Suspense queries
// =============================================================================

function PostWithAuthor({ postId }: { postId: number }) {
  // Both queries use Suspense
  const { data: post } = useSuspenseQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  const { data: author } = useSuspenseQuery({
    queryKey: ['user', post.authorId],
    queryFn: () => fetchUser(post.authorId),
  })

  // Both post and author are guaranteed to exist
  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {author.name}</p>
      <div>{post.content}</div>
    </article>
  )
}

// =============================================================================
// v5 - Suspense with parallel queries (useSuspenseQueries)
// =============================================================================

import { useSuspenseQueries } from '@tanstack/react-query'

function Dashboard({ userId }: { userId: number }) {
  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
      },
      {
        queryKey: ['posts', userId],
        queryFn: () => fetchUserPosts(userId),
      },
      {
        queryKey: ['comments', userId],
        queryFn: () => fetchUserComments(userId),
      },
    ],
  })

  const [userQuery, postsQuery, commentsQuery] = results

  // All data is guaranteed to exist (no undefined)
  return (
    <div>
      <h1>{userQuery.data.name}</h1>
      <p>{postsQuery.data.length} posts</p>
      <p>{commentsQuery.data.length} comments</p>
    </div>
  )
}

// =============================================================================
// TypeScript Benefits Comparison
// =============================================================================

// v4 with suspense flag
function Example_v4() {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    suspense: true,
  })

  // ❌ TypeScript: data is User | undefined
  console.log(data!.name) // Need non-null assertion
}

// v5 with useSuspenseQuery
function Example_v5() {
  const { data } = useSuspenseQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  // ✅ TypeScript: data is User (never undefined)
  console.log(data.name) // No assertion needed!
}

export {
  PostDetails_v4,
  PostDetails_v5,
  App_v4,
  App_v5,
  App_v5_WithErrorBoundary,
  PostWithAuthor,
  Dashboard,
}
