---
name: orval-openapi-zod-generator-ko
description: OpenAPI/Swagger 스펙에서 타입 안전 API 클라이언트와 Zod 스키마 자동 생성. React Query 통합, 풀스택 타입 안전성, 런타임 검증에 특화.
risk: safe
source: self
---

# Orval OpenAPI Zod 생성기 (Orval OpenAPI Zod Generator)

Orval은 OpenAPI 명세(Specification)를 실제 서비스에서 바로 사용할 수 있는 API 클라이언트와 Zod 스키마로 변환해주는 고성능 타입 안전 생성기입니다. 이 스킬은 Orval과 Zod 통합을 마스터하기 위한 종합 가이드를 제공하며, 현대적인 TypeScript 애플리케이션에서 런타임 검증, 프론트엔드-백엔드 간 계약 동기화, 그리고 원활한 개발자 경험을 보장합니다.

## When to Use (언제 사용하나요)

- **타입 안전 API 설계**: OpenAPI 스펙을 단일 진실 공급원(Source of Truth)으로 사용하는 시스템을 구축할 때.
- **런타임 검증 필요**: 클라이언트나 서버로 들어오는 데이터가 정해진 규격(Contract)과 일치하는지 확인해야 할 때.
- **React Query 통합**: Zod 검증 기능이 내장된 타입 안전한 커스텀 훅을 자동으로 생성하고 싶을 때.
- **스키마 공유**: 프론트엔드(React/Next.js)와 백엔드(Hono/Express) 간에 Zod 검증 로직을 공유해야 할 때.
- **모노레포 관리**: Turborepo나 Nx 워크스페이스에서 여러 패키지에 걸쳐 API 클라이언트를 통합 관리할 때.
- **v8 마이그레이션**: 이전 버전에서 ESM 전용 및 fetch가 기본인 Orval v8로 업그레이드할 때.
- **커스텀 클라이언트 구현**: 생성된 클라이언트에 인증, 로깅, 커스텀 재시도 로직 등을 추가하고 싶을 때.
- **폼 검증**: API 검증에 사용하는 스키마를 프론트엔드 폼 검증에도 그대로 사용하고 싶을 때.
- **모의 데이터(Mock) 및 테스트**: 통합 테스트를 위해 Zod 스키마 기반의 MSW(Mock Service Worker) 핸들러를 생성하고 싶을 때.

## 이런 경우엔 사용하지 마세요

- **OpenAPI 스펙 없음**: Swagger나 OpenAPI 명세서가 없는 경우.
- **매우 단순한 프로젝트**: 엔드포인트가 1~2개뿐인 매우 간단한 프로젝트라면 Zod 스키마를 수동으로 작성하는 것이 더 빠를 수 있습니다.
- **Node.js 기반이 아닌 백엔드 전용**: 백엔드가 Go, Python, Ruby 등으로 작성된 경우 이 도구의 활용도가 낮아집니다(프론트엔드용으로는 여전히 유용합니다).
- **레거시 브라우저 지원**: `fetch`나 현대적인 ESM을 지원하지 않는 아주 오래된 브라우저를 지원해야 한다면 추가적인 폴리필이나 트랜스파일링이 필요합니다.

## 1. 설치 및 환경 설정

Orval v8+은 ESM(EcmaScript Modules)과 성능을 우선시하며 현대적인 Node.js 생태계에 최적화되어 있습니다.

### 요구 사항
- **Node.js**: 22.18.0 이상 버전.
- **패키지 타입**: Orval v8 사용을 위해 `package.json`에 `"type": "module"` 설정이 필수입니다.
- **TypeScript**: 최적의 타입 추론을 위해 5.0 이상 버전을 권장합니다.

### 핵심 의존성 설치
```bash
# 핵심 도구
npm install orval zod -D

# 선택 사항 (권장 통합 라이브러리)
npm install @tanstack/react-query # React Query 훅 사용 시
npm install @hono/zod-validator   # 서버 사이드 검증 시
npm install msw -D                # API 모킹 시
npm install axios                 # Fetch 대신 Axios 선호 시
```

### 프로젝트 초기화
1. `package.json`에 `"type": "module"`이 설정되어 있는지 확인합니다.
2. `orval.config.ts` 파일을 생성합니다.
3. `package.json`에 스크립트를 추가합니다: `"generate": "orval"`.

## 2. 설정 상세 가이드: `orval.config.ts`

설정 파일은 Orval의 핵심입니다. 여러 서비스에 대한 생성 설정을 세밀하게 제어할 수 있습니다.

### 입력(Input) 설정
`input` 속성은 명세서의 위치와 처리 방식을 정의합니다.
```typescript
input: {
  target: './openapi.yaml', // 로컬 파일 경로 또는 URL
  validation: true,         // 생성 전 스펙 검증 (적극 권장)
  // 특정 엔드포인트만 생성하도록 필터링 가능
  filters: {
    tags: ['user', 'pet'],  // 이 태그가 포함된 작업만 생성
  }
}
```

### 출력 모드(Output Modes): 구조 선택
확장성을 고려하여 적절한 모드를 선택하는 것이 중요합니다.

| 모드 | 파일 구조 | 용도 |
| :--- | :--- | :--- |
| `single` | `api.ts` | 소규모 프로젝트, 간단한 스크립트. |
| `split` | `api.ts`, `api.models.ts` | 중규모 프로젝트, 구현부와 타입 분리. |
| `tags` | `pet/pet.ts`, `user/user.ts` | 도메인 태그별로 팀이 나뉘어 관리하는 대규모 API. |
| `tags-split` | `pet/pet.ts`, `pet/pet.models.ts` 등 | 100개 이상의 엔드포인트를 가진 엔터프라이즈급 프로젝트. |

### `override`를 활용한 세부 제어
`override` 블록에서는 생성기의 동작을 세밀하게 커스텀할 수 있습니다.

```typescript
override: {
  zod: {
    generate: {
      schemas: true, // 스펙의 모든 컴포넌트/모델에 대한 스키마 생성
      request: true, // 요청 본문(Request Body) 스키마 생성
      response: true, // 응답 본문(Response Body) 스키마 생성 (테스트 시 중요)
      query: true,   // 쿼리 파라미터 스키마 생성
      params: true,  // 경로 파라미터(Path Parameter) 스키마 생성
    }
  },
  query: {
    useQuery: true,
    useMutation: true,
    useInfinite: true,
    useInfiniteQueryParam: 'cursor', // 페이지네이션 키
    options: {
      queries: {
        staleTime: 1000 * 60 * 5, // 모든 쿼리의 기본 staleTime 설정
      }
    }
  }
}
```

## 3. Zod 생성: 기술 심층 분석

Orval의 Zod 생성은 단순한 타입 매핑 그 이상입니다. 실제 동작하는 검증 로직을 만들어냅니다.

### 강제 형변환(Coercion): 웹의 "문자열" 특성 처리
웹 요청(쿼리 파라미터, 경로 파라미터)은 항상 문자열입니다. 스펙에서 `integer`라고 정의했더라도, Zod는 강제 형변환을 활성화하지 않으면 검증에 실패합니다.

```typescript
override: {
  zod: {
    coerce: {
      query: true,  // 문자열 "123"을 숫자 123으로 변환
      params: true, // 문자열 "true"를 불리언 true로 변환
    }
  }
}
```

### 엄격 모드(Strict Mode) vs 일반 검증
- **엄격 모드 (`strict: true`)**: `z.object(...).strict()`를 생성합니다. 데이터에 정의되지 않은 추가 속성이 있으면 검증에 실패합니다. 시스템에 의도치 않은 데이터가 유입되는 것을 방지하는 데 유용합니다.
- **일반 모드 (기본값)**: 표준 `z.object(...)`를 사용합니다. 추가 속성은 무시됩니다. 백엔드에서 새로운 필드가 추가되어도 클라이언트가 깨지지 않으므로 응답(Response) 검증에 더 안전합니다.

### 날짜/시간 및 커스텀 포맷
Orval은 OpenAPI의 `date-time`을 `z.string().datetime()`으로 매핑합니다. 이 동작을 커스텀할 수 있습니다.
```typescript
zod: {
  dateTimeOptions: {
    format: 'date-time', // 옵션: 'date-time', 'date'
  }
}
```

### 전처리 로직(Preprocessing)
Zod가 데이터를 처리하기 전에 원본 입력을 변환해야 할 때가 있습니다.
```typescript
override: {
  zod: {
    preprocess: (input) => {
      // 예: 객체 내의 모든 문자열 공백 제거
      return input;
    }
  }
}
```

## 4. 실전 예제: React Query (TanStack Query v5) 통합

Orval의 가장 인기 있는 기능은 TanStack Query 훅을 자동 생성하는 것입니다.

### 생성된 훅 패턴
Orval은 모든 GET 작업에 대해 `useGet...`을, 모든 뮤테이션에 대해 `usePost...`, `usePut...` 등의 훅을 생성합니다.

```typescript
// src/components/PetList.tsx
import { useListPets } from '../api/generated/petstore';

export const PetList = () => {
  // 변수, 데이터, 에러에 대한 완전한 타입 안전성 보장
  const { data, isLoading, error } = useListPets({ limit: 10 });

  if (isLoading) return <p>로딩 중...</p>;
  if (error) return <p>에러 발생: {error.message}</p>;

  return (
    <ul>
      {data?.map(pet => (
        <li key={pet.id}>{pet.name}</li>
      ))}
    </ul>
  );
};
```

### 뮤테이션 및 낙관적 업데이트
Orval이 생성한 뮤테이션은 뮤테이션 변수에 대해 타입 안전한 접근을 제공합니다.

```typescript
const mutation = useCreatePet();

const handleAddPet = () => {
  mutation.mutate({
    data: { name: '복실이', tag: '강아지' }
  }, {
    onSuccess: () => {
      // 데이터 무효화 및 다시 불러오기 로직
    }
  });
};
```

### 인피니트 쿼리 (Infinite Queries)
API가 커서나 오프셋을 통한 페이지네이션을 지원하는 경우, Orval은 `useInfiniteQuery` 훅을 생성할 수 있습니다.

```typescript
// orval.config.ts
query: {
  useInfinite: true,
  useInfiniteQueryParam: 'next_cursor',
}

// 사용 예시
const { data, fetchNextPage, hasNextPage } = useListPetsInfinite();
```

## 5. 서버 사이드 검증: Hono 통합

Hono와 Orval의 조합은 궁극적인 풀스택 타입 안전성을 제공합니다.

### 기존의 문제점
보통 OpenAPI로 규격을 정의하고 프론트엔드용 타입을 생성하지만, 백엔드 검증 로직은 수동으로 작성하곤 합니다. 이는 **스펙 불일치(Spec Drift)**로 이어집니다.

### 해결책
Orval을 사용해 OpenAPI 스펙에서 Zod 스키마를 생성하고, 이를 Hono 라우트에서 직접 임포트하여 사용합니다.

```typescript
// backend/routes/pets.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createPetBodySchema } from '../generated/api.zod';

const app = new Hono();

app.post('/', zValidator('json', createPetBodySchema), (c) => {
  // 'data'는 이제 스펙에 따라 완벽하게 검증되고 타입이 지정되었습니다!
  const data = c.req.valid('json');
  
  return c.json({ success: true, pet: data });
});
```

## 6. 고급 커스텀: 뮤테이터(Mutators)와 인터셉터

### 뮤테이터 패턴
뮤테이터는 Orval이 실제 HTTP 요청을 보낼 때 사용하는 커스텀 함수입니다. 내부의 기본 `fetch`나 `axios` 인스턴스를 대체합니다.

#### 활용 사례: Bearer 인증 및 리프레시 토큰
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
    source.cancel('React Query에 의해 쿼리가 취소되었습니다.');
  };

  return promise;
};
```

#### 설정 방법
```typescript
override: {
  mutator: {
    path: './src/api/custom-instance.ts',
    name: 'customInstance',
  }
}
```

### 인터셉터 (Interceptors)
Axios를 사용하는 경우, 뮤테이터에서 내보낸 인스턴스에 표준 Axios 인터셉터를 그대로 사용할 수 있습니다.

```typescript
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 리프레시 토큰 로직 처리
    }
    return Promise.reject(error);
  }
);
```

## 7. 모노레포 전략: 공유 규격 아키텍처

모노레포에서는 일관성이 핵심입니다. API 규격만을 위한 전용 패키지를 두는 것이 좋습니다.

### 패키지 구성: `@my-org/api`
1. **포함 내용**: `openapi.yaml`, `orval.config.ts`, 그리고 생성된 코드들.
2. **내보내기(Export)**: 타입, Zod 스키마, 그리고 훅.
3. **사용처(Consumer)**: `apps/web`, `apps/mobile`, `apps/admin`.

### 장점
- **불일치 제로**: API 스펙이 변경되면 모든 사용처에서 타입을 수정할 때까지 컴파일 에러가 발생합니다.
- **중앙 집중식 인증**: 뮤테이터와 인증 로직을 한 곳에서 관리합니다.
- **모킹(Mocking)**: `msw` 핸들러를 내보내어 각 앱이 독립적으로 쉽게 실행될 수 있도록 합니다.

## 8. 폼 검증: UI와 스키마 공유

Orval의 Zod 스키마는 `@hookform/resolvers/zod` 패키지를 통해 `react-hook-form`과 함께 사용할 수 있습니다.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPetBodySchema } from './generated/api.zod';

const PetForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createPetBodySchema),
  });

  const onSubmit = (data) => {
    // data는 API 스펙과 일치함이 보장됩니다.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">제출</button>
    </form>
  );
};
```

## 9. 테스트 전략: 유닛 및 통합 테스트

### Vitest를 이용한 생성된 훅 테스트
`@testing-library/react-hooks`와 MSW를 사용하여 생성된 훅을 테스트합니다.

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useGetPetById } from './generated/petstore';
import { server } from './mocks/server'; // MSW 서버

test('useGetPetById가 반려동물 데이터를 반환함', async () => {
  const { result } = renderHook(() => useGetPetById('1'), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data.name).toBe('테스트용 반려동물');
});
```

### 모의 데이터(Mock Data) 검증
생성된 Zod 스키마를 사용하여 MSW 모의 핸들러를 검증하세요. 이렇게 하면 모의 데이터가 실제 스펙과 멀어지는 것을 방지할 수 있습니다!

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { getPetByIdResponseSchema } from '../generated/api.zod';

export const handlers = [
  http.get('/pets/:id', () => {
    const mockData = { id: '1', name: '테스트용 반려동물' };
    
    // 모의 데이터를 스펙에 맞춰 검증!
    getPetByIdResponseSchema.parse(mockData);
    
    return HttpResponse.json(mockData);
  }),
];
```

## 10. v8 마이그레이션 및 ESM 환경

Orval v8은 순수 ESM 패키지입니다. 따라서 프로젝트 설정이 올바르게 되어 있어야 합니다.

### 흔한 마이그레이션 에러
1. **"require() of ES Module"**: `orval.config.ts`나 의존성이 CJS인데 Orval을 불러오려 할 때 발생합니다. `"type": "module"`과 `import`를 사용하여 해결하세요.
2. **"Unknown file extension .ts"**: 스크립트 실행 시 `tsx`나 ESM 로더가 포함된 `ts-node`를 사용하거나, 내부적으로 이를 처리하는 `npx orval`을 사용하세요.
3. **Axios vs Fetch**: v8에서는 `client: 'fetch'`가 기본값입니다. Axios가 필요하다면 설정 파일에서 명시적으로 지정해야 합니다.

### Node 22+ 기능 활용
Orval v8은 Node 22의 향상된 성능과 안정적인 fetch 기능을 활용합니다. CI/CD 환경에서 Node 22.x 또는 23.x를 사용하고 있는지 확인하세요.

## 11. 문제 해결: 흔한 함정들

### 문제: 무한 재귀 / 순환 참조
대규모 OpenAPI 스펙에서는 모델들이 서로를 참조하는 경우가 많습니다 (예: `User`는 `Company`를 가지고, `Company`는 `User` 목록을 가짐).
- **Orval 해결책**: `mode: 'split'` 또는 `mode: 'tags-split'`을 사용하세요. 생성기가 임포트를 더 잘 관리하게 되어 생성된 코드 내의 순환 의존성 위험을 줄여줍니다.
- **Zod 해결책**: Orval은 재귀 모델에 대해 자동으로 `z.lazy()`를 사용하지만, 매우 복잡한 순환 구조는 스펙 설계 단계에서의 수정이 필요할 수 있습니다.

### 문제: 거대한 번들 사이즈
모든 모델에 대해 Zod 스키마를 생성하면 번들 크기가 커질 수 있습니다.
- **해결책**: 입력 설정의 `filters`를 사용하여 실제로 사용하는 엔드포인트와 모델만 생성하세요.

### 문제: 런타임 스펙 불일치
백엔드가 변경되었는데 클라이언트를 다시 생성하지 않았다면, Zod는 런타임에서 에러를 던질 것입니다.
- **해결책**: 응답(Response)에 대해 `zod.strict: false`를 사용하세요. 백엔드에서 새로운 필드가 추가되더라도 클라이언트가 유연하게 대처할 수 있게 됩니다.

## 12. 베스트 프랙티스

1. **스펙 우선 워크플로우 (Schema-First)**: 항상 OpenAPI 스펙을 먼저 업데이트하세요. `src/api/generated` 폴더 내의 파일을 직접 수정해서는 안 됩니다.
2. **생성 자동화**: Orval 실행을 `prebuild` 스크립트의 일부로 포함시키세요.
3. **태그를 활용한 조직화**: OpenAPI 스펙에 태그를 잘 지정하면 Orval이 생성하는 파일 구조도 깔끔해집니다.
4. **모든 것의 형변환 (Coerce)**: 특별한 이유가 없다면 쿼리 및 경로 파라미터에 대해 항상 Zod coercion을 활성화하세요.
5. **타입이 지정된 에러**: `override.errors` 옵션을 사용하여 특정 HTTP 상태 코드를 커스텀 에러 타입으로 매핑하세요.
6. **MSW 모킹**: 항상 `mock: true`를 활성화하고 생성된 MSW 핸들러를 테스트에 사용하세요. 수동으로 모킹 데이터를 작성하는 시간을 획기적으로 줄여줍니다.

## 13. 풀스택 구현 가이드: 스펙에서 UI까지

Orval + Zod 워크플로우를 사용하여 새로운 "사용자 생성(Create User)" 기능을 구현하는 단계별 가이드입니다.

### 1단계: OpenAPI 명세 업데이트
`openapi.yaml`에 새로운 엔드포인트와 컴포넌트를 추가합니다.

```yaml
paths:
  /users:
    post:
      tags: [user]
      summary: 새 사용자 생성
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: 사용자 생성됨
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

### 2단계: 코드 생성
Orval 생성기를 실행합니다.

```bash
npx orval
```

이 명령은 다음 파일들을 생성합니다:
1. `createUser` 뮤테이션 훅 (React Query).
2. `createUserBodySchema` (Zod).
3. `userSchema` (Zod).
4. 모든 스키마에 대한 TypeScript 인터페이스.

### 3단계: 서버 사이드 검증 구현 (Hono)
생성된 스키마를 사용하여 엔드포인트를 보호합니다.

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserBodySchema } from '../generated/api.zod';

const app = new Hono();

app.post('/users', zValidator('json', createUserBodySchema), async (c) => {
  const body = c.req.valid('json');
  
  // body는 이미 검증되었고 타입이 지정되어 있습니다!
  const user = await db.users.create({ data: body });
  
  return c.json(user, 201);
});
```

### 4단계: 프론트엔드 폼 구현 (React + React Hook Form)
클라이언트 사이드 검증에 동일한 스키마를 사용합니다.

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
        <label>사용자명</label>
        <input {...register('username')} />
        {errors.username && <p>{errors.username.message}</p>}
      </div>
      
      <div>
        <label>이메일</label>
        <input {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '저장 중...' : '사용자 생성'}
      </button>
    </form>
  );
};
```

### 5단계: 테스트로 검증
통합이 제대로 작동하는지 확인하는 테스트를 작성합니다.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from './UserForm';

test('유효하지 않은 입력에 대해 검증 에러를 표시함', async () => {
  render(<UserForm />);
  
  fireEvent.click(screen.getByText('사용자 생성'));
  
  expect(await screen.findByText('사용자명은 필수입니다')).toBeInTheDocument();
  expect(await screen.findByText('이메일은 필수입니다')).toBeInTheDocument();
});
```

## 14. 고급 뮤테이터 요리법 (Cookbook)

`custom-instance.ts`에서 사용할 수 있는 실전 패턴들입니다.

### 예제 1: 지수 백오프 재시도 (Exponential Backoff Retry)
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

### 예제 2: 디버깅을 위한 요청 로깅
```typescript
export const customInstance = async <T>(config: any): Promise<T> => {
  const start = Date.now();
  try {
    const response = await fetch(config.url, config);
    const data = await response.json();
    console.debug(`[API] ${config.method} ${config.url} - ${Date.now() - start}ms`);
    return data;
  } catch (error) {
    console.error(`[API 에러] ${config.method} ${config.url}`, error);
    throw error;
  }
};
```

### 예제 3: 멀티 BaseURL 스위처
```typescript
export const customInstance = <T>(config: any): Promise<T> => {
  const isAuthService = config.url.startsWith('/auth');
  const baseURL = isAuthService 
    ? process.env.AUTH_API_URL 
    : process.env.MAIN_API_URL;
    
  return fetch(`${baseURL}${config.url}`, config).then(res => res.json());
};
```

## 15. 설정 참조 가이드

| 속성 | 타입 | 설명 |
| :--- | :--- | :--- |
| `input` | `string \| object` | OpenAPI 명세 경로. 로컬 YAML/JSON 또는 원격 URL 가능. |
| `output` | `object` | 메인 생성 설정. |
| `output.target` | `string` | 메인 출력 파일 경로 (예: `./src/api/generated.ts`). |
| `output.schemas` | `string` | 공유 모델 저장 디렉토리. 다중 파일 모드에서 필수 권장. |
| `output.client` | `string` | 생성할 HTTP 클라이언트: `fetch`, `axios`, `react-query`, `swr`, `zod`. |
| `output.mode` | `string` | `single` (한 파일), `split` (두 파일), `tags` (태그별 폴더), `tags-split` (가장 모듈화됨). |
| `output.mock` | `boolean` | API 모킹을 위한 MSW 핸들러 생성 여부. |
| `output.prettier` | `boolean` | 생성된 파일에 Prettier 자동 실행 여부. |
| `output.clean` | `boolean` | 생성 전 대상 디렉토리를 비워 오래된 파일 제거 여부. |
| `output.headers` | `boolean` | 생성된 클라이언트에 표준 HTTP 헤더 포함 여부. |
| `output.baseUrl` | `string` | 생성된 클라이언트에 베이스 URL 하드코딩 (프로덕션에서는 비권장). |
| `override.zod` | `object` | 강제 형변환, 엄격 모드 등 Zod 관련 세부 설정. |
| `override.mutator` | `object` | 커스텀 HTTP 클라이언트 래퍼의 경로와 이름. |
| `override.header` | `function` | 모든 생성된 파일 상단에 커스텀 코드를 삽입하는 콜백. |
| `override.query` | `object` | `useInfinite` 등 React Query / SWR 전용 옵션. |
| `override.formData` | `boolean` | 특정 요청 본문에 대해 `FormData` 사용 강제 여부. |
| `override.operationName` | `function` | 생성된 함수 및 훅의 커스텀 네이밍 로직. |

## 16. 타입 안전 도구 생태계

Orval은 고립된 도구가 아닙니다. "타입 중심 개발(Type-Driven Development)"로 향하는 거대한 흐름의 일부입니다.

### 관련 도구
- **Spectral**: OpenAPI 명세 린팅 표준. Orval에 넣기 전 스펙의 품질을 보장하기 위해 사용하세요.
- **Tsup**: esbuild 기반의 설정 없는 번들러. 모노레포에서 공유 API 클라이언트 패키지를 빌드할 때 최적입니다.
- **Zod-to-JSON-Schema**: Orval의 반대 역할입니다. Zod 스키마가 있고 이를 통해 OpenAPI 스펙을 생성해야 할 때 사용하세요.
- **TanStack Router**: 데이터 프리페칭을 위해 Orval이 생성한 훅과 완벽하게 연동되는 React용 타입 안전 라우터입니다.

## 17. 참고 자료

- [Orval 공식 문서](https://orval.dev)
- [Orval Zod 가이드](https://orval.dev/guides/zod)
- [Zod 공식 문서](https://zod.dev)
- [TanStack Query (React Query) 사이트](https://tanstack.com/query/latest)
- [Hono.dev - Zod 우선 프레임워크](https://hono.dev)
- [Spectral OpenAPI 린터](https://stoplight.io/open-source/spectral)
- [MSW (Mock Service Worker)](https://mswjs.io)
- [Faker.js 문서](https://fakerjs.dev)

---

Orval + Zod를 마스터하는 것은 백엔드 변경에 유연하게 대처하고 유지보수가 쉬운 고품질 타입 안전 웹 애플리케이션을 구축하는 핵심입니다. 이 가이드를 따라 "데이터 불일치" 버그를 근본적으로 제거하고, 보일러플레이트 코드를 작성하는 대신 실제 기능을 개발하는 데 집중하세요.
