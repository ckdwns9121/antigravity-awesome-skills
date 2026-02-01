import { defineConfig } from 'orval';

/**
 * 프로덕션에 권장되는 React Query + Zod 설정입니다.
 * 이 설정은 다음을 생성합니다:
 * 1. TanStack Query 훅 (useQuery, useMutation)
 * 2. 런타임 검증을 위한 Zod 스키마
 * 3. 임포트를 깔끔하게 유지하기 위한 별도의 .zod.ts 스키마 파일
 */
export default defineConfig({
  petstore: {
    input: './petstore.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      mock: true, // MSW 모킹 데이터도 함께 생성합니다!
      override: {
        zod: true, // Zod 생성 활성화
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'next_cursor',
        },
      },
    },
  },
  // 패키지 간 스키마 공유를 위한 별도의 Zod 전용 타겟
  petstoreZod: {
    input: './petstore.yaml',
    output: {
      target: './src/api/generated/petstore.zod.ts',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
});
