import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
// 참고: 이 임포트 경로는 Orval에 의해 생성된 코드를 참조합니다.
import { 
  createPetBodySchema, 
  getPetParamsSchema,
  listPetsQuerySchema 
} from './generated/petstore.zod';

/**
 * Hono 서버에서 Orval이 생성한 Zod 스키마를 사용하는 예제입니다.
 * 이를 통해 서버 사이드 검증이 항상 OpenAPI 스펙과 
 * 동기화된 상태를 유지할 수 있습니다.
 */
const app = new Hono();

// 쿼리 파라미터 검증
app.get('/pets', zValidator('query', listPetsQuerySchema), (c) => {
  const query = c.req.valid('query');
  return c.json({ pets: [], query });
});

// 경로 파라미터 검증
app.get('/pets/:petId', zValidator('param', getPetParamsSchema), (c) => {
  const { petId } = c.req.valid('param');
  return c.json({ id: petId, name: '샘플 반려동물' });
});

// JSON 본문(Body) 검증
app.post('/pets', zValidator('json', createPetBodySchema), (c) => {
  const body = c.req.valid('json');
  return c.json({ message: '반려동물이 생성되었습니다', pet: body }, 201);
});

export default app;
