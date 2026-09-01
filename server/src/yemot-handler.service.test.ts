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

// ---- Prompts reused across scenario steps ----

const TZ_PROMPT = /enter.*id/i;
const TRANSPORT_PROMPT = /transport/i;
const DEPARTURE_PROMPT = /departure.*07:30/i;
const KLASS_PROMPT = /enter klass number/i;
const ABSENT_STUDENT_PROMPT = /enter absent student number/i;
const CONFIRM_STUDENT_PROMPT = /confirm student/i;

// ---- Generic scenario-step primitives — every step below is one of these ----

function ask(builder: YemotScenarioBuilder, prompt: RegExp, response: string): YemotScenarioBuilder {
  return builder.systemAsks(prompt).userResponds(response);
}

function askThenReject(builder: YemotScenarioBuilder, prompt: RegExp, response: string, errorMessage: RegExp): YemotScenarioBuilder {
  return ask(builder, prompt, response).systemSends(errorMessage);
}

// ---- Shared fixture data ----

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

// ---- Shared scenario setup — the one seeding primitive every flow-specific setup builds on ----
//
// Adding a call-wide requirement (a new entity every flow needs, a change to how User/Teacher
// rows are shaped) belongs here so every flow-specific setup (transportSetup, teacherSetup,
// managerSetup) picks it up without editing each one, let alone every test.

function baseSetup(
  name: string,
  opts: { user?: any; teachers?: any[]; texts?: any[]; extraSeeds?: Record<string, any[]> } = {},
): YemotScenarioBuilder {
  const { user = baseUser, teachers, texts = baseTexts, extraSeeds = {} } = opts;
  let builder = new YemotScenarioBuilder(name).seed('User', [user]);
  if (teachers) builder = builder.seed('Teacher', teachers);
  for (const [entityName, rows] of Object.entries(extraSeeds)) {
    builder = builder.seed(entityName, rows);
  }
  return builder.seed('Text', texts);
}

// ---- Transport-call setup + steps ----

const defaultStudent = { id: 100, userId: 1, tz: '123456789', name: 'Test Student' };
const defaultTransportation = { id: 10, userId: 1, key: 5, departureTime: '07:30' };
const defaultStudentKlass = { id: 50, userId: 1, studentReferenceId: 100, klassReferenceId: 200 };

// Common transport-call fixtures (Student/Transportation/StudentKlass), each overridable —
// pass `studentKlass: null` for the "no class" cases.
function transportSetup(
  name: string,
  opts: { student?: any; transportation?: any; studentKlass?: any | null; extraSeeds?: Record<string, any[]> } = {},
): YemotScenarioBuilder {
  const {
    student = defaultStudent,
    transportation = defaultTransportation,
    studentKlass = defaultStudentKlass,
    extraSeeds = {},
  } = opts;
  const seeds: Record<string, any[]> = { Student: [student], Transportation: [transportation] };
  if (studentKlass) seeds.StudentKlass = [studentKlass];
  Object.assign(seeds, extraSeeds);
  return baseSetup(name, { extraSeeds: seeds });
}

function respondToTz(builder: YemotScenarioBuilder, tz: string): YemotScenarioBuilder {
  return ask(builder, TZ_PROMPT, tz);
}

function respondToTransport(builder: YemotScenarioBuilder, num: string): YemotScenarioBuilder {
  return ask(builder, TRANSPORT_PROMPT, num);
}

function confirmDeparture(builder: YemotScenarioBuilder, confirm: boolean): YemotScenarioBuilder {
  return ask(builder, DEPARTURE_PROMPT, confirm ? '1' : '2');
}

// ---- Seminar-attendance steps ----

function welcomesTeacher(builder: YemotScenarioBuilder): YemotScenarioBuilder {
  return builder.systemSends(/hello teacher/i);
}

// Manual klass entry followed by the system's spoken confirmation.
function entersKlass(builder: YemotScenarioBuilder, klassKey: string): YemotScenarioBuilder {
  return ask(builder, KLASS_PROMPT, klassKey).systemSends(/confirmed klass/i);
}

// Enters a student number, then answers the name-confirmation prompt yes/no.
function confirmsStudentName(builder: YemotScenarioBuilder, studentNumber: string, accept: boolean): YemotScenarioBuilder {
  const answered = ask(ask(builder, ABSENT_STUDENT_PROMPT, studentNumber), CONFIRM_STUDENT_PROMPT, accept ? '1' : '2');
  return accept ? answered : answered.systemSends(/name rejected/i);
}

function finishAbsentStudentEntry(builder: YemotScenarioBuilder): YemotScenarioBuilder {
  return ask(builder, ABSENT_STUDENT_PROMPT, '0');
}

describe('YemotHandlerService — react-admin-nestjs', () => {
  const runner = new YemotScenarioRunner(YemotHandlerService as any);

  beforeEach(() => useFakeDateOnly());
  afterEach(() => jest.useRealTimers());

  it('past deadline — immediate hangup with CLOSED', async () => {
    jest.setSystemTime(israelTimeAt(9, 0));

    const scenario = baseSetup('Past deadline').systemHangsUp(/closed/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('happy path — valid TZ, valid transport, confirmed departure', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const builder = transportSetup('Transport happy path');
    respondToTz(builder, '123456789');
    respondToTransport(builder, '5');
    confirmDeparture(builder, true);
    const scenario = builder.systemHangsUp(/success/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('invalid TZ — error message then retry with valid TZ', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const builder = transportSetup('Invalid TZ retry');
    askThenReject(builder, TZ_PROMPT, '999', /not found|invalid/i);
    respondToTz(builder, '123456789');
    respondToTransport(builder, '5');
    confirmDeparture(builder, true);
    const scenario = builder.systemHangsUp(/success/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
  });

  it('already reported today — hangup with ALREADY_REPORTED', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const builder = baseSetup('Already reported', {
      extraSeeds: {
        Student: [defaultStudent],
        KnownAbsence: [
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
        ],
      },
    });
    respondToTz(builder, '123456789');
    const scenario = builder.systemHangsUp(/already reported/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('invalid transport — error message then retry with valid transport', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const builder = transportSetup('Invalid transport retry');
    respondToTz(builder, '123456789');
    askThenReject(builder, TRANSPORT_PROMPT, '99', /invalid|try again/i);
    respondToTransport(builder, '5');
    confirmDeparture(builder, true);
    const scenario = builder.systemHangsUp(/success/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
  });

  it('late departure — user says no to confirmation, hangup with LATE_DEPARTURE', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const builder = transportSetup('Late departure', { studentKlass: null });
    respondToTz(builder, '123456789');
    respondToTransport(builder, '5');
    confirmDeparture(builder, false);
    const scenario = builder.systemHangsUp(/departure time passed/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  // ---- Previously skipped tests for uncovered branches ----

  it('no class found — hangup with STUDENT.NO_CLASS', async () => {
    jest.setSystemTime(israelTimeAt(7, 0));

    const builder = transportSetup('No class found', { studentKlass: null });
    respondToTz(builder, '123456789');
    respondToTransport(builder, '5');
    confirmDeparture(builder, true);
    const scenario = builder.systemHangsUp(/no class/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('past deadline — exactly at 8:50, hangup with CLOSED', async () => {
    jest.setSystemTime(israelTimeAt(8, 50));

    const scenario = baseSetup('Past deadline at 8:50').systemHangsUp(/closed/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
    expect(result.hungup).toBe(true);
  });

  it('before deadline — at 8:49, continues to student input', async () => {
    jest.setSystemTime(israelTimeAt(8, 49));

    const builder = transportSetup('Before deadline at 8:49');
    respondToTz(builder, '123456789');
    respondToTransport(builder, '5');
    confirmDeparture(builder, true);
    const scenario = builder.systemHangsUp(/success/i).build();

    const result = await runner.run(scenario);
    expect(result.passed).toBe(true);
  });

  describe('seminar attendance flow', () => {
    const seminarTexts = [
      { userId: 0, name: 'SEMINAR.KLASS_PROMPT', description: '', value: 'Enter klass number' },
      { userId: 0, name: 'SEMINAR.INVALID_KLASS', description: '', value: 'Invalid klass, try again' },
      { userId: 0, name: 'SEMINAR.ALREADY_REPORTED', description: '', value: 'Already reported for this klass today' },
      { userId: 0, name: 'SEMINAR.ABSENT_STUDENT_PROMPT', description: '', value: 'Enter absent student number, or 0 to finish' },
      { userId: 0, name: 'SEMINAR.INVALID_STUDENT_NUM', description: '', value: 'Invalid student number, try again' },
      { userId: 0, name: 'SEMINAR.NO_STUDENTS_IN_KLASS', description: '', value: 'No students found for this klass' },
      { userId: 0, name: 'SEMINAR.CONFIRM_STUDENT_NAME', description: '', value: 'Confirm student {studentName}' },
      { userId: 0, name: 'SEMINAR.STUDENT_NAME_REJECTED', description: '', value: 'Name rejected, try again' },
      { userId: 0, name: 'SEMINAR.WELCOME', description: '', value: 'Hello teacher {teacherName}' },
      { userId: 0, name: 'SEMINAR.KLASS_CONFIRMED', description: '', value: 'Confirmed klass {klassName}' },
      { userId: 0, name: 'SEMINAR.TEACHER_CODE_PROMPT', description: '', value: 'Enter teacher code' },
      { userId: 0, name: 'SEMINAR.INVALID_TEACHER_CODE', description: '', value: 'Invalid teacher code, try again' },
    ];
    const allTexts = [...baseTexts, ...seminarTexts];

    const TEACHER_CODE_PROMPT = /enter teacher code/i;

    const teacher = { id: 1, userId: 1, tz: '900000001', name: 'Teacher One', number: '1' };
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

    // Shared teacher-call setup: seeds the teacher (identified by keyed-in code, not caller
    // phone) + seminar text set.
    function teacherSetup(
      name: string,
      opts: { permissions?: Record<string, boolean>; teachers?: any[]; extraSeeds?: Record<string, any[]> } = {},
    ): YemotScenarioBuilder {
      const { permissions = { seminarAttendanceYemot: true }, teachers = [teacher], extraSeeds = {} } = opts;
      return baseSetup(name, { user: { ...baseUser, permissions }, teachers, texts: allTexts, extraSeeds });
    }

    // teacherSetup + a Klass + full student roster — the common seminar-call opening. Pass a
    // `phone` on the klass fixture to have it auto-resolve from the (fixed) mock caller number
    // '0501234567'; omit it to exercise the manual-klass-entry fallback.
    function seminarBuilder(
      name: string,
      klass: { id: number; year: number },
      permissions: Record<string, boolean> = { seminarAttendanceYemot: true },
    ): YemotScenarioBuilder {
      return teacherSetup(name, {
        permissions,
        extraSeeds: { Klass: [klass], Student: roster(), StudentKlass: studentKlasses(klass.id, klass.year) },
      });
    }

    function entersTeacherCode(builder: YemotScenarioBuilder, code: string): YemotScenarioBuilder {
      return ask(builder, TEACHER_CODE_PROMPT, code);
    }

    // Manual klass entry (klass phone unrecognized/absent), then teacher code, ending with the
    // system's welcome — the common opening for a call that doesn't auto-resolve by phone.
    function startsSeminarCall(builder: YemotScenarioBuilder, klassKey: string, teacherCode: string): YemotScenarioBuilder {
      return welcomesTeacher(entersTeacherCode(entersKlass(builder, klassKey), teacherCode));
    }

    it('happy path with lessonSignature permission — creates a ReportGroup/Session and AttReport rows', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 200, userId: 1, key: 7, name: 'Klass Seven', year };

      const builder = seminarBuilder('Seminar happy path with report group', klass, {
        seminarAttendanceYemot: true,
        lessonSignature: true,
      })
        .seed('AttReport', [])
        .seed('ReportGroup', [])
        .seed('ReportGroupSession', []);
      startsSeminarCall(builder, '7', '1');
      confirmsStudentName(builder, '11', true);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

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
        expect(report.howManyLessons).toBe(1);
      }
    });

    it('happy path without lessonSignature permission — saves AttReport rows without a report group', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 210, userId: 1, key: 8, name: 'Klass Eight', year };

      const builder = seminarBuilder('Seminar happy path without report group', klass)
        .seed('AttReport', [])
        .seed('ReportGroup', [])
        .seed('ReportGroupSession', []);
      startsSeminarCall(builder, '8', '1');
      confirmsStudentName(builder, '11', true);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

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

    it('klass phone recognized — resolves klass automatically, skips manual klass prompt', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 280, userId: 1, key: 16, name: 'Klass Sixteen', year, phone: '0501234567' };

      const builder = seminarBuilder('Seminar klass phone recognized', klass).seed('AttReport', []);
      builder.systemSends(/confirmed klass/i);
      entersTeacherCode(builder, '1');
      welcomesTeacher(builder);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
      expect(result.saved['AttReport']).toHaveLength(3);
    });

    it('star during teacher code — switches to manual klass selection', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const phoneKlass = { id: 281, userId: 1, key: 17, name: 'Klass Seventeen', year, phone: '0501234567' };
      const manualKlass = { id: 282, userId: 1, key: 18, name: 'Klass Eighteen', year };

      const builder = teacherSetup('Seminar star escape to manual klass', {
        extraSeeds: {
          Klass: [phoneKlass, manualKlass],
          Student: roster(),
          StudentKlass: studentKlasses(282, year),
        },
      }).seed('AttReport', []);
      builder.systemSends(/confirmed klass/i);
      ask(builder, TEACHER_CODE_PROMPT, '*');
      entersKlass(builder, '18');
      entersTeacherCode(builder, '1');
      welcomesTeacher(builder);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
      expect(result.saved['AttReport']).toHaveLength(3);
    });

    it('invalid teacher code — error message then retry with valid code', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 283, userId: 1, key: 19, name: 'Klass Nineteen', year };

      const builder = seminarBuilder('Seminar invalid teacher code retry', klass).seed('AttReport', []);
      entersKlass(builder, '19');
      askThenReject(builder, TEACHER_CODE_PROMPT, '99', /invalid teacher code/i);
      entersTeacherCode(builder, '1');
      welcomesTeacher(builder);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('invalid klass number — error message then retry with valid klass', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 220, userId: 1, key: 9, name: 'Klass Nine', year };

      const builder = seminarBuilder('Seminar invalid klass retry', klass);
      askThenReject(builder, KLASS_PROMPT, '99', /invalid klass/i);
      entersKlass(builder, '9');
      entersTeacherCode(builder, '1');
      welcomesTeacher(builder);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('invalid student number — error message then retry with valid student number', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 230, userId: 1, key: 10, name: 'Klass Ten', year };

      const builder = seminarBuilder('Seminar invalid student number retry', klass);
      startsSeminarCall(builder, '10', '1');
      askThenReject(builder, ABSENT_STUDENT_PROMPT, '999', /invalid student number/i);
      confirmsStudentName(builder, '11', true);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
    });

    it('name confirmation rejected — retries the student number prompt', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 235, userId: 1, key: 15, name: 'Klass Fifteen', year };

      const builder = seminarBuilder('Seminar name confirmation rejected', klass).seed('AttReport', []);
      startsSeminarCall(builder, '15', '1');
      confirmsStudentName(builder, '11', false);
      confirmsStudentName(builder, '12', true);
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      const byStudent = Object.fromEntries(result.saved['AttReport'].map((r: any) => [r.studentReferenceId, r]));
      expect(byStudent[101].absCount).toBe(0);
      expect(byStudent[102].absCount).toBe(1);
    });

    it('allows reporting again for the same klass on the same day', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 240, userId: 1, key: 11, name: 'Klass Eleven', year };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const builder = seminarBuilder('Seminar repeated report for klass', klass)
        .seed('AttReport', [
          { id: 900, userId: 1, studentReferenceId: 101, klassReferenceId: 240, reportDate: today, absCount: 0 },
        ]);
      startsSeminarCall(builder, '11', '1');
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
      expect(result.saved['AttReport']).toHaveLength(3);
    });

    it('schedule matches teacher and resolved klass — sets lessonReferenceId', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 260, userId: 1, key: 13, name: 'Klass Thirteen', year };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const builder = seminarBuilder('Seminar schedule match sets lessonReferenceId', klass)
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
        .seed('AttReport', []);
      startsSeminarCall(builder, '13', '1');
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      for (const report of result.saved['AttReport']) {
        expect(report.klassReferenceId).toBe(260);
        expect(report.lessonReferenceId).toBe(700);
      }
    });

    it('schedule matches teacher but not the resolved klass — lessonReferenceId stays unset', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 284, userId: 1, key: 20, name: 'Klass Twenty', year };
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const builder = seminarBuilder('Seminar schedule for different klass', klass)
        .seed('LessonSchedule', [
          {
            userId: 1,
            year,
            teacherReferenceId: teacher.id,
            klassReferenceId: 9999,
            lessonReferenceId: 701,
            scheduleDate: today,
            startTime: '07:00',
          },
        ])
        .seed('AttReport', []);
      startsSeminarCall(builder, '20', '1');
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);

      expect(result.saved['AttReport']).toHaveLength(3);
      for (const report of result.saved['AttReport']) {
        expect(report.lessonReferenceId).toBeFalsy();
      }
    });

    it('no schedule for teacher today — no lessonReferenceId', async () => {
      jest.setSystemTime(israelTimeAt(7, 0));
      const year = getCurrentHebrewYear();
      const klass = { id: 270, userId: 1, key: 14, name: 'Klass Fourteen', year };

      const builder = seminarBuilder('Seminar no schedule', klass).seed('AttReport', []);
      startsSeminarCall(builder, '14', '1');
      finishAbsentStudentEntry(builder);
      const scenario = builder.systemHangsUp(/success/i).build();

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

      const builder = teacherSetup('Seminar no students in klass', { extraSeeds: { Klass: [klass] } });
      startsSeminarCall(builder, '12', '1');
      const scenario = builder.systemHangsUp(/no students/i).build();

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

    // Shared manager-call setup: manager User (identified by managerPhone) + two teachers.
    function managerSetup(
      name: string,
      opts: { managerPhone?: string; extraSeeds?: Record<string, any[]> } = {},
    ): YemotScenarioBuilder {
      const { managerPhone = '0501234567', extraSeeds = {} } = opts;
      return baseSetup(name, {
        user: { ...baseUser, permissions: { seminarAttendanceYemot: true }, additionalData: { managerPhone } },
        teachers: [
          { id: 1, userId: 1, tz: '900000001', name: 'Teacher A', phone: '0509999999' },
          { id: 2, userId: 1, tz: '900000002', name: 'Teacher B', phone: '0508888888' },
        ],
        texts: managerAllTexts,
        extraSeeds,
      });
    }

    it('reports which teachers reported today and which did not', async () => {
      jest.setSystemTime(israelTimeAt(10, 0));
      const year = getCurrentHebrewYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scenario = managerSetup('Manager report status', {
        extraSeeds: {
          LessonSchedule: [
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
          ],
          AttReport: [
            { id: 900, userId: 1, teacherReferenceId: 1, klassReferenceId: 200, reportDate: today, absCount: 0 },
          ],
        },
      })
        .systemHangsUp(/Teacher A.*Teacher B/s)
        .build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });

    it('no lesson schedules today — hangup with MANAGER.NO_SCHEDULE_TODAY', async () => {
      jest.setSystemTime(israelTimeAt(10, 0));

      const scenario = managerSetup('Manager no schedule today').systemHangsUp(/no teachers scheduled/i).build();

      const result = await runner.run(scenario);
      expect(result.passed).toBe(true);
      expect(result.hungup).toBe(true);
    });
  });
});
