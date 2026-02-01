import { defineConfig } from 'orval';

/**
 * 커스텀 뮤테이터(Custom Mutator) 설정 예제입니다.
 * 뮤테이터를 사용하면 기본 HTTP 클라이언트(fetch/axios)를 확장하여
 * 다음과 같은 로직을 추가할 수 있습니다:
 * - Bearer 토큰 주입
 * - 리프레시 토큰 처리
 * - 요청/응답 로깅
 * - 베이스 URL 관리
 */

// 1. Orval 설정
export default defineConfig({
  petstore: {
    input: './petstore.yaml',
    output: {
      target: './src/api/generated/petstore.ts',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});

// 2. 구현부 (이 내용을 src/api/custom-instance.ts에 저장하세요)
/*
export const customInstance = <T>(
  config: { 
    url: string; 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; 
    params?: any; 
    data?: any; 
    headers?: any 
  }
): Promise<T> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.petstore.io';
  
  return fetch(`${API_URL}${config.url}${config.params ? '?' + new URLSearchParams(config.params) : ''}`, {
    method: config.method,
    headers: {
      ...config.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '네트워크 응답이 올바르지 않습니다.');
    }
    return response.json();
  });
};
*/
