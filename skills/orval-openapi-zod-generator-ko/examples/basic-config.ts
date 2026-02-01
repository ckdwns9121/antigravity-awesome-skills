import { defineConfig } from 'orval';

/**
 * 순수 Zod 스키마 생성을 위한 기본 Orval 설정입니다.
 * HTTP 레이어를 직접 처리하고 싶거나, 
 * 폼 검증(예: react-hook-form)에 스키마만 사용하고 싶을 때 사용하세요.
 */
export default defineConfig({
  petstore: {
    input: {
      target: './petstore.yaml',
      // URL을 제공할 수도 있습니다.
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
