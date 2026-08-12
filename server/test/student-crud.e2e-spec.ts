import '@shared/config/crud.config';
import * as cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { HttpTestUtils } from '@shared/utils/testing/e2e/test-utils';

// The CRUD list endpoint returns a plain array by default, or a paginated
// { data: [...] } object once pagination kicks in (e.g. a page/limit query param).
// Normalize so list assertions below don't depend on which shape came back.
const asList = (body: any): any[] => (Array.isArray(body) ? body : body.data);

describe('student CRUD (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpUtils: HttpTestUtils;
  let cookie: string;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
    dataSource = moduleFixture.get(DataSource);
    httpUtils = new HttpTestUtils(app);

    const registerRes = await httpUtils
      .post('/auth/register', { username: 'e2e_student_user', password: 'TestPass_123', name: 'E2E' })
      .expect(200);
    const setCookieHeader = registerRes.headers['set-cookie'];
    const authCookie = setCookieHeader?.[0]?.match(/Authentication=[^;]+/)?.[0];
    if (!authCookie) {
      throw new Error(`Expected an Authentication cookie from /auth/register, got Set-Cookie: ${JSON.stringify(setCookieHeader)}`);
    }
    cookie = authCookie;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    await app?.close();
    await moduleFixture?.close();
  });

  it('runs a full create -> list -> update -> delete lifecycle over real HTTP', async () => {
    // Create
    const createRes = await httpUtils
      .post('/student', { tz: '123456789', name: 'תלמידה בדיקה' })
      .set('Cookie', cookie)
      .expect(201);
    const studentId = createRes.body.id;
    expect(studentId).toBeDefined();
    expect(createRes.body).toEqual(expect.objectContaining({ tz: '123456789', name: 'תלמידה בדיקה' }));

    // List
    const listRes = await httpUtils
      .get(`/student?filter[0]=tz||$eq||123456789`)
      .set('Cookie', cookie)
      .expect(200);
    expect(asList(listRes.body).some((s: any) => s.id === studentId)).toBe(true);

    // Update
    const updateRes = await httpUtils
      .patch(`/student/${studentId}`, { name: 'תלמידה מעודכנת' })
      .set('Cookie', cookie)
      .expect(200);
    expect(updateRes.body).toEqual(expect.objectContaining({ id: studentId, name: 'תלמידה מעודכנת' }));

    const getAfterUpdateRes = await httpUtils.get(`/student/${studentId}`).set('Cookie', cookie).expect(200);
    expect(getAfterUpdateRes.body.name).toBe('תלמידה מעודכנת');

    // Delete
    await httpUtils.delete(`/student/${studentId}`).set('Cookie', cookie).expect(200);

    await httpUtils.get(`/student/${studentId}`).set('Cookie', cookie).expect(404);
  });

  it('rejects creating a student without the required fields', async () => {
    const res = await httpUtils.post('/student', {}).set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});
