import { defineConfig } from 'orval';

/**
 * 종합 Orval 설정 템플릿입니다.
 * 프로젝트의 요구 사항에 맞춰 복사하여 수정해 사용하세요.
 */
export default defineConfig({
  // API 서비스 이름
  myApi: {
    // OpenAPI 명세 경로
    input: {
      target: './openapi.yaml',
      // validation: true, // 생성 전 스펙 검증 활성화 권장
    },
    output: {
      // 생성된 코드가 저장될 위치
      target: './src/api/generated/index.ts',
      
      // 공유 타입/모델이 저장될 위치
      schemas: './src/api/model',
      
      // 클라이언트 타입: 'fetch', 'axios', 'react-query', 'swr', 'angular', 'zod'
      client: 'react-query',
      
      // 파일 생성 모드: 'single', 'split', 'tags', 'tags-split'
      mode: 'tags-split',
      
      // 테스트를 위한 MSW 모킹 데이터 생성
      mock: true,
      
      // Prettier 통합
      prettier: true,
      
      // 생성 전 대상 디렉토리 비우기
      clean: true,
      
      override: {
        // Zod 생성 설정
        zod: {
          generate: {
            schemas: true,
            request: true,
            response: true,
            query: true,
            params: true,
          },
          strict: {
            query: true,
            params: true,
            request: true,
            response: false,
          },
          coerce: {
            query: true,
          },
        },
        
        // React Query 설정 (client: 'react-query'인 경우)
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: true,
          useInfiniteQueryParam: 'next_cursor',
          options: {
            queries: {
              staleTime: 1000 * 60 * 5, // 5분
            },
          },
        },
        
        // 전역 헤더 주입 (정적)
        header: (info) => [
          `import { customHeader } from '../header'`,
          `// Orval v8에 의해 생성됨`,
        ],
      },
    },
  },
});
