# Orval + Zod 모노레포 설정 가이드

현대적인 모노레포(Turborepo, Nx, 또는 pnpm workspaces) 환경에서는 여러 패키지에 걸쳐 API 규격을 관리하는 것이 매우 중요합니다. 이 가이드는 Orval로 생성된 코드를 공유하기 위한 베스트 프랙티스를 설명합니다.

## 권장 아키텍처

```text
.
├── apps/
│   ├── web/               # Next.js / Vite 앱
│   └── mobile/            # React Native 앱
└── packages/
    ├── api-spec/          # 단일 진실 공급원 (OpenAPI YAML/JSON)
    └── api-client/        # 공유되는 생성된 클라이언트 + Zod 스키마
```

## 1단계: `packages/api-spec`

OpenAPI 명세서를 전용 패키지에 보관하세요. 이를 통해 명세서만 독립적으로 버전 관리할 수 있습니다.

```json
// packages/api-spec/package.json
{
  "name": "@my-org/api-spec",
  "version": "1.0.0",
  "exports": {
    "./openapi.yaml": "./openapi.yaml"
  }
}
```

## 2단계: `packages/api-client`

이 패키지는 실제 코드 생성을 담당하며, `@my-org/api-spec`에 의존합니다.

### orval.config.ts

```typescript
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../api-spec/openapi.yaml',
    output: {
      target: './src/index.ts',
      schemas: './src/model',
      client: 'react-query',
      mode: 'split',
      override: {
        zod: true
      }
    }
  }
});
```

### package.json 스크립트

```json
{
  "name": "@my-org/api-client",
  "scripts": {
    "generate": "orval",
    "build": "tsup src/index.ts --format esm,cjs --dts"
  },
  "devDependencies": {
    "orval": "^8.0.0",
    "tsup": "^8.0.0"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.0.0"
  }
}
```

## 3단계: `apps/web`에서 사용하기

공유 클라이언트를 설치합니다.

```bash
pnpm add @my-org/api-client --filter web
```

사용 예시:

```typescript
import { useGetPets } from '@my-org/api-client';
import { petSchema } from '@my-org/api-client/zod'; // 모드가 split인 경우

const { data } = useGetPets();
```

## 장점

1. **DRY (Don't Repeat Yourself)**: 한 번 생성하고 모든 곳에서 재사용합니다.
2. **일관성**: 웹과 모바일 앱이 정확히 동일한 Zod 검증 로직을 공유합니다.
3. **CI/CD 효율성**: 한 곳에서만 검증 및 생성을 수행하면 됩니다.
