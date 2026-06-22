import { YemotScenarioBuilder, YemotScenarioRunner, useFakeDateOnly } from '@shared/utils/yemot/testing';
import { YemotHandlerService } from './yemot-handler.service';

/**
 * Returns a Date that, when read with `toLocaleString` in Asia/Jerusalem,
 * represents the given local hour:minute on the current day.
 */
function israelTimeAt(hour: number, minute: number): Date {
  const now = new Date();
  const utcMs = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour - 3,
    minute,
  );
  return new Date(utcMs);
}

describe('YemotHandlerService — react-admin-nestjs', () => {
  const runner = new YemotScenarioRunner(YemotHandlerService as any);

  beforeEach(() => useFakeDateOnly());
  afterEach(() => jest.useRealTimers());

  const baseUser = { id: 1, phoneNumber: '099999999', name: 'Test User', effective_id: null };

  const baseTexts = [
    { userId: 0, name: 'STUDENT.TZ_PROMPT', description: '', value: 'Enter your ID number' },
    { userId: 0, name: 'STUDENT.INVALID_TZ', description: '', value: 'ID not found, try again' },
    { userId: 0, name: 'STUDENT.ALREADY_REPORTED', description: '', value: 'Already reported today' },
    { userId: 0, name: 'TRANSPORT.NUM_PROMPT', description: '', value: 'Enter transport number' },
    { userId: 0, name: 'TRANSPORT.INVALID_NUM', description: '', value: 'Invalid transport, try again' },
    { userId: 0, name: 'TRANSPORT.DEPARTURE_CONFIRM', description: '', value: 'Departure at {departureTime}?' },
    { userId: 0, name: 'SYSTEM.REPORT_SUCCESS', description: '', value: 'Report submitted successfully' },
    { userId: 0, name: 'SYSTEM.CLOSED', description: '', value: 'System closed' },
    { userId: 0, name: 'SYSTEM.LATE_DEPARTURE', description: '', value: 'Departure time passed' },
    { userId: 0, name: 'STUDENT.NO_CLASS', description: '', value: 'No class found' },
    { userId: 0, name: 'GENERAL.YES', description: '', value: 'Yes' },
    { userId: 0, name: 'GENERAL.NO', description: '', value: 'No' },
  ];

  it('past deadline — immediate hangup with CLOSED', async () => {
    jest.setSystemTime(israelTimeAt(9, 0));

    const scenario = new YemotScenarioBuilder('Past deadline')
      .seed('User', [baseUser])
      .seed('Text', baseTexts)
      .systemHangsUp(/closed/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('happy path — valid TZ, valid transport, confirmed departure', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const scenario = new YemotScenarioBuilder('Transport happy path')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('Transportation', [{ id: 10, userId: 1, key: 5, departureTime: '07:30' }])
      .seed('StudentKlass', [{ id: 50, userId: 1, studentReferenceId: 100, klassReferenceId: 200 }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemAsks(/transport/i)
      .userResponds('5')
      .systemAsks(/departure.*07:30/i)
      .userResponds('1')
      .systemHangsUp(/success/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('invalid TZ — error message then retry with valid TZ', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const scenario = new YemotScenarioBuilder('Invalid TZ retry')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('Transportation', [{ id: 10, userId: 1, key: 5, departureTime: '07:30' }])
      .seed('StudentKlass', [{ id: 50, userId: 1, studentReferenceId: 100, klassReferenceId: 200 }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('999')
      .systemSends(/not found|invalid/i)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemAsks(/transport/i)
      .userResponds('5')
      .systemAsks(/departure.*07:30/i)
      .userResponds('1')
      .systemHangsUp(/success/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
  });

  it('already reported today — hangup with ALREADY_REPORTED', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scenario = new YemotScenarioBuilder('Already reported')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('KnownAbsence', [{
        userId: 1,
        studentReferenceId: 100,
        studentTz: '123456789',
        reportDate: today,
        absnceCount: 1,
        isApproved: true,
        comment: 'test',
        klassReferenceId: 200,
      }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemHangsUp(/already reported/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('invalid transport — error message then retry with valid transport', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const scenario = new YemotScenarioBuilder('Invalid transport retry')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('Transportation', [{ id: 10, userId: 1, key: 5, departureTime: '07:30' }])
      .seed('StudentKlass', [{ id: 50, userId: 1, studentReferenceId: 100, klassReferenceId: 200 }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemAsks(/transport/i)
      .userResponds('99')
      .systemSends(/invalid|try again/i)
      .systemAsks(/transport/i)
      .userResponds('5')
      .systemAsks(/departure.*07:30/i)
      .userResponds('1')
      .systemHangsUp(/success/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
  });

  it('late departure — user says no to confirmation, hangup with LATE_DEPARTURE', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const scenario = new YemotScenarioBuilder('Late departure')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('Transportation', [{ id: 10, userId: 1, key: 5, departureTime: '07:30' }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemAsks(/transport/i)
      .userResponds('5')
      .systemAsks(/departure.*07:30/i)
      .userResponds('2')
      .systemHangsUp(/departure time passed/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Stub tests for uncovered branches ----

  it.skip('no class found — hangup with STUDENT.NO_CLASS', () => { });

  it.skip('past deadline — exactly at 8:50, hangup with CLOSED', () => { });

  it.skip('before deadline — at 8:49, continues to student input', () => { });
});
