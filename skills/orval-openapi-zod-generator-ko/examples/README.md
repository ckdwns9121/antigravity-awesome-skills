# Orval + Zod 예제

이 디렉토리는 Orval과 Zod 검증을 사용하는 실제 프로덕션 수준의 예제들을 포함하고 있습니다.

## 예제 구성

### 1. [기본 설정 (Basic Configuration)](./basic-config.ts)
OpenAPI 명세에서 순수 Zod 스키마를 생성하는 간단한 설정입니다. 전체 API 클라이언트가 필요하지 않고 런타임 검증만 필요한 프로젝트에 적합합니다.

### 2. [Zod 검증을 포함한 React Query](./react-query-with-zod.ts)
TanStack Query 훅과 Zod 검증 스키마를 모두 생성하는 이중 설정입니다. 타입 안전한 프론트엔드 개발의 가장 이상적인 형태를 보여줍니다.

### 3. [Hono 서버 검증 (Hono Server Validation)](./hono-server-validation.ts)
생성된 Zod 스키마를 Hono 백엔드 서버에서 사용하여 들어오는 요청(JSON 본문, 쿼리 파라미터 등)을 검증하는 방법을 보여줍니다.

### 4. [인증 기능이 포함된 커스텀 뮤테이터](./custom-mutator.ts)
생성된 코드를 깔끔하게 유지하면서, 인증 헤더와 에러 처리가 포함된 커스텀 HTTP 클라이언트(뮤테이터)를 구현하는 복잡한 예제입니다.

## 예제 사용 방법

1. 원하는 설정을 `orval.config.ts` 파일에 복사합니다.
2. 필요한 의존성(`orval`, `zod` 등)이 설치되어 있는지 확인합니다.
3. `npx orval` 명령어를 실행하여 코드를 생성합니다.
4. 생성된 스키마나 훅을 애플리케이션에 임포트하여 사용합니다.
