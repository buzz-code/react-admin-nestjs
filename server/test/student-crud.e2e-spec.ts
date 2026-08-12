import '@shared/config/crud.config';
import { createTestApp, TestAppHelper } from '@shared/utils/testing/e2e/test-app.helper';
import { HttpTestUtils, registerAndAuthenticate, asList } from '@shared/utils/testing/e2e/test-utils';
import { AppModule } from 'src/app.module';

describe('student CRUD (e2e)', () => {
  let testApp: TestAppHelper;
  let httpUtils: HttpTestUtils;
  let cookie: string;

  beforeAll(async () => {
    testApp = createTestApp(AppModule);
    const app = await testApp.initializeApp();
    httpUtils = new HttpTestUtils(app);
    cookie = await registerAndAuthenticate(httpUtils, {
      username: 'e2e_student_user',
      password: 'TestPass_123',
      name: 'E2E',
    });
  });

  afterAll(async () => {
    await testApp.cleanup();
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
