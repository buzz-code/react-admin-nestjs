import { YemotScenarioBuilder, YemotScenarioRunner, useFakeDateOnly } from '@shared/utils/yemot/testing';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { YemotHandlerService } from './yemot-handler.service';

/**
 * Returns a Date that, when read with `toLocaleString` in Asia/Jerusalem,
 * represents the given local hour:minute on the current day.
 */
function israelTimeAt(hour: number, minute: number): Date {
  const now = new Date();
  const utcMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour - 3, minute);
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
      .seed('KnownAbsence', [
        {
          userId: 1,
          studentReferenceId: 100,
          studentTz: '123456789',
          reportDate: today,
          absnceCount: 1,
          isApproved: true,
          comment: 'test',
          klassReferenceId: 200,
        },
      ])
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

  // ---- Previously skipped tests for uncovered branches ----

  it('no class found — hangup with STUDENT.NO_CLASS', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const scenario = new YemotScenarioBuilder('No class found')
      .seed('User', [baseUser])
      .seed('Student', [{ id: 100, userId: 1, tz: '123456789', name: 'Test Student' }])
      .seed('Transportation', [{ id: 10, userId: 1, key: 5, departureTime: '07:30' }])
      .seed('Text', baseTexts)
      .systemAsks(/enter.*id/i)
      .userResponds('123456789')
      .systemAsks(/transport/i)
      .userResponds('5')
      .systemAsks(/departure.*07:30/i)
      .userResponds('1')
      .systemHangsUp(/no class/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('past deadline — exactly at 8:50, hangup with CLOSED', async () => {
    jest.setSystemTime(israelTimeAt(8, 50));

    const scenario = new YemotScenarioBuilder('Past deadline at 8:50')
      .seed('User', [baseUser])
      .seed('Text', baseTexts)
      .systemHangsUp(/closed/i)
      .build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('before deadline — at 8:49, continues to student input', async () => {
    jest.setSystemTime(israelTimeAt(8, 49));

    const scenario = new YemotScenarioBuilder('Before deadline at 8:49')
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
  });

  describe('seminar attendance flow', () => {
    const seminarTexts = [
      { userId: 0, name: 'TEACHER.PHONE_NOT_RECOGNIZED', description: '', value: 'Teacher phone not recognized' },
      { userId: 0, name: 'SEMINAR.KLASS_PROMPT', description: '', value: 'Enter klass number' },
      { userId: 0, name: 'SEMINAR.INVALID_KLASS', description: '', value: 'Invalid klass, try again' },
      { userId: 0, name: 'SEMINAR.ALREADY_REPORTED', description: '', value: 'Already reported for this klass today' },
      { userId: 0, name: 'SEMINAR.ABSENT_STUDENT_PROMPT', description: '', value: 'Enter absent student number, or 0 to finish' },
      { userId: 0, name: 'SEMINAR.INVALID_STUDENT_NUM', description: '', value: 'Invalid student number, try again' },
      { userId: 0, name: 'SEMINAR.NO_STUDENTS_IN_KLASS', description: '', value: 'No students found for this klass' },
      { userId: 0, name: 'SEMINAR.CONFIRM_STUDENT_NAME', description: '', value: 'Confirm student {studentName}' },
      { userId: 0, name: 'SEMINAR.STUDENT_NAME_REJECTED', description: '', value: 'Name rejected, try again' },
    ];
    const allTexts = [...baseTexts, ...seminarTexts];

    const seminarUser = (permissions: Record<string, boolean>) => ({ ...baseUser, permissions });
    const teacher = { id: 1, userId: 1, tz: '900000001', name: 'Teacher One', phone: '0501234567' };
    const roster = () => [
      { id: 101, userId: 1, tz: '300000001', name: 'Student A', studentNumber: '11' },
      { id: 102, userId: 1, tz: '300000002', name: 'Student B', studentNumber: '12' },
      { id: 103, userId: 1, tz: '300000003', name: 'Student C', studentNumber: '13' },
    ];
    const studentKlasses = (klassReferenceId: number, year: number) => [
      { id: 501, userId: 1, studentReferenceId: 101, klassReferenceId, year },
      { id: 502, userId: 1, studentReferenceId: 102, klassReferenceId, year },
      { id: 503, userId: 1, studentReferenceId: 103, klassReferenceId, year },
    ];

    it('happy path with lessonSignature permission — creates a ReportGroup/Session and AttReport rows', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 200, userId: 1, key: 7, name: 'Klass Seven', year };

      const scenario = new YemotScenarioBuilder('Seminar happy path with report group')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true, lessonSignature: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(200, year))
        .seed('Text', allTexts)
        .seed('AttReport', [])
        .seed('ReportGroup', [])
        .seed('ReportGroupSession', [])
        .systemAsks(/enter klass number/i)
        .userResponds('7')
        .systemAsks(/enter absent student number/i)
        .userResponds('11')
        .systemAsks(/confirm student/i)
        .userResponds('1')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      expect(result.saved['ReportGroup']).toHaveLength(1);
      expect(result.saved['ReportGroupSession']).toHaveLength(1);

      const session = result.saved['ReportGroupSession'][0];
      expect(session.startTime).toBeTruthy();

      const byStudent = Object.fromEntries(
        result.saved['AttReport'].map((r: any) => [r.studentReferenceId, r]),
      );
      expect(byStudent[101].absCount).toBe(1);
      expect(byStudent[102].absCount).toBe(0);
      expect(byStudent[103].absCount).toBe(0);
      for (const report of result.saved['AttReport']) {
        expect(report.reportGroupSessionId).toBe(session.id);
      }
    });

    it('happy path without lessonSignature permission — saves AttReport rows without a report group', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 210, userId: 1, key: 8, name: 'Klass Eight', year };

      const scenario = new YemotScenarioBuilder('Seminar happy path without report group')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(210, year))
        .seed('Text', allTexts)
        .seed('AttReport', [])
        .seed('ReportGroup', [])
        .seed('ReportGroupSession', [])
        .systemAsks(/enter klass number/i)
        .userResponds('8')
        .systemAsks(/enter absent student number/i)
        .userResponds('11')
        .systemAsks(/confirm student/i)
        .userResponds('1')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      expect(result.saved['ReportGroup']).toHaveLength(0);
      expect(result.saved['ReportGroupSession']).toHaveLength(0);
      for (const report of result.saved['AttReport']) {
        expect(report.reportGroupSessionId).toBeFalsy();
      }
    });

    it('teacher phone not recognized — hangup with TEACHER.PHONE_NOT_RECOGNIZED', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));

      const scenario = new YemotScenarioBuilder('Seminar unrecognized teacher phone')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Text', allTexts)
        .systemHangsUp(/not recognized/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('invalid klass number — error message then retry with valid klass', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 220, userId: 1, key: 9, name: 'Klass Nine', year };

      const scenario = new YemotScenarioBuilder('Seminar invalid klass retry')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(220, year))
        .seed('Text', allTexts)
        .systemAsks(/enter klass number/i)
        .userResponds('99')
        .systemSends(/invalid klass/i)
        .systemAsks(/enter klass number/i)
        .userResponds('9')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('invalid student number — error message then retry with valid student number', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 230, userId: 1, key: 10, name: 'Klass Ten', year };

      const scenario = new YemotScenarioBuilder('Seminar invalid student number retry')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(230, year))
        .seed('Text', allTexts)
        .systemAsks(/enter klass number/i)
        .userResponds('10')
        .systemAsks(/enter absent student number/i)
        .userResponds('999')
        .systemSends(/invalid student number/i)
        .systemAsks(/enter absent student number/i)
        .userResponds('11')
        .systemAsks(/confirm student/i)
        .userResponds('1')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('name confirmation rejected — retries the student number prompt', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 235, userId: 1, key: 15, name: 'Klass Fifteen', year };

      const scenario = new YemotScenarioBuilder('Seminar name confirmation rejected')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(235, year))
        .seed('Text', allTexts)
        .seed('AttReport', [])
        .systemAsks(/enter klass number/i)
        .userResponds('15')
        .systemAsks(/enter absent student number/i)
        .userResponds('11')
        .systemAsks(/confirm student/i)
        .userResponds('2')
        .systemSends(/name rejected/i)
        .systemAsks(/enter absent student number/i)
        .userResponds('12')
        .systemAsks(/confirm student/i)
        .userResponds('1')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      const byStudent = Object.fromEntries(result.saved['AttReport'].map((r: any) => [r.studentReferenceId, r]));
      expect(byStudent[101].absCount).toBe(0);
      expect(byStudent[102].absCount).toBe(1);
    });

    it('already reported today for this klass — hangup with SEMINAR.ALREADY_REPORTED', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 240, userId: 1, key: 11, name: 'Klass Eleven', year };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scenario = new YemotScenarioBuilder('Seminar already reported for klass')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('AttReport', [
          { id: 900, userId: 1, studentReferenceId: 101, klassReferenceId: 240, reportDate: today, absCount: 0 },
        ])
        .seed('Text', allTexts)
        .systemAsks(/enter klass number/i)
        .userResponds('11')
        .systemHangsUp(/already reported/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('schedule match found — auto-detects lesson/klass, skips manual klass prompt, sets lessonReferenceId', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 260, userId: 1, key: 13, name: 'Klass Thirteen', year };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scenario = new YemotScenarioBuilder('Seminar auto-detected schedule')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('LessonSchedule', [
          {
            userId: 1,
            year,
            teacherReferenceId: teacher.id,
            klassReferenceId: 260,
            lessonReferenceId: 700,
            scheduleDate: today,
            startTime: '07:00',
          },
        ])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(260, year))
        .seed('Text', allTexts)
        .seed('AttReport', [])
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      for (const report of result.saved['AttReport']) {
        expect(report.klassReferenceId).toBe(260);
        expect(report.lessonReferenceId).toBe(700);
      }
    });

    it('no schedule for teacher today — falls back to manual klass entry with no lessonReferenceId', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 270, userId: 1, key: 14, name: 'Klass Fourteen', year };

      const scenario = new YemotScenarioBuilder('Seminar no schedule fallback')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Student', roster())
        .seed('StudentKlass', studentKlasses(270, year))
        .seed('Text', allTexts)
        .seed('AttReport', [])
        .systemAsks(/enter klass number/i)
        .userResponds('14')
        .systemAsks(/enter absent student number/i)
        .userResponds('0')
        .systemHangsUp(/success/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      for (const report of result.saved['AttReport']) {
        expect(report.lessonReferenceId).toBeFalsy();
      }
    });

    it('no students in klass — hangup with SEMINAR.NO_STUDENTS_IN_KLASS', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 250, userId: 1, key: 12, name: 'Klass Twelve', year };

      const scenario = new YemotScenarioBuilder('Seminar no students in klass')
        .seed('User', [seminarUser({ seminarAttendanceYemot: true })])
        .seed('Teacher', [teacher])
        .seed('Klass', [klass])
        .seed('Text', allTexts)
        .systemAsks(/enter klass number/i)
        .userResponds('12')
        .systemHangsUp(/no students/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });

  describe('manager report call', () => {
    const managerTexts = [
      { userId: 0, name: 'MANAGER.NO_SCHEDULE_TODAY', description: '', value: 'No teachers scheduled today' },
      {
        userId: 0,
        name: 'MANAGER.REPORT_STATUS_TODAY',
        description: '',
        value: 'Reported: {reportedList}. Not reported: {notReportedList}.',
      },
    ];
    const managerAllTexts = [...baseTexts, ...managerTexts];
    const managerUser = (managerPhone: string) => ({
      ...baseUser,
      permissions: { seminarAttendanceYemot: true },
      additionalData: { managerPhone },
    });

    it('reports which teachers reported today and which did not', async () => {
      jest.setSystemTime(israelTimeAt(10, 0));
      const year = getCurrentHebrewYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scenario = new YemotScenarioBuilder('Manager report status')
        .seed('User', [managerUser('0501234567')])
        .seed('Teacher', [
          { id: 1, userId: 1, tz: '900000001', name: 'Teacher A', phone: '0509999999' },
          { id: 2, userId: 1, tz: '900000002', name: 'Teacher B', phone: '0508888888' },
        ])
        .seed('LessonSchedule', [
          {
            userId: 1,
            year,
            teacherReferenceId: 1,
            klassReferenceId: 200,
            lessonReferenceId: 700,
            scheduleDate: today,
            startTime: '08:00',
          },
          {
            userId: 1,
            year,
            teacherReferenceId: 2,
            klassReferenceId: 201,
            lessonReferenceId: 701,
            scheduleDate: today,
            startTime: '09:00',
          },
        ])
        .seed('AttReport', [
          { id: 900, userId: 1, teacherReferenceId: 1, klassReferenceId: 200, reportDate: today, absCount: 0 },
        ])
        .seed('Text', managerAllTexts)
        .systemHangsUp(/Teacher A.*Teacher B/s)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no lesson schedules today — hangup with MANAGER.NO_SCHEDULE_TODAY', async () => {
      jest.setSystemTime(israelTimeAt(10, 0));

      const scenario = new YemotScenarioBuilder('Manager no schedule today')
        .seed('User', [managerUser('0501234567')])
        .seed('Text', managerAllTexts)
        .systemHangsUp(/no teachers scheduled/i)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });
});
