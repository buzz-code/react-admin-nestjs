import { Injectable } from '@nestjs/common';
import { BaseYemotHandlerService } from '@shared/utils/yemot/v2/yemot-router.service';
import { hasPermission } from '@shared/utils/permissionsUtil';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { Student } from './db/entities/Student.entity';
import { Transportation } from './db/entities/Transportation.entity';
import { KnownAbsence } from './db/entities/KnownAbsence.entity';
import { StudentKlass } from './db/entities/StudentKlass.entity';
import { Teacher } from './db/entities/Teacher.entity';
import { Klass } from './db/entities/Klass.entity';
import { AttReport } from './db/entities/AttReport.entity';
import { ReportGroup } from './db/entities/ReportGroup.entity';
import { ReportGroupSession } from './db/entities/ReportGroupSession.entity';
import { LessonSchedule } from './db/entities/LessonSchedule.entity';
import { Between, In } from 'typeorm';

const SCHEDULE_MATCH_TOLERANCE_MINUTES = 90;
/**
 * Yemot Handler Service for processing incoming Yemot calls
 * Currently returns a maintenance mode message
 */

@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  override async processCall(): Promise<void> {
    await this.getUserByDidPhone();
    this.logger.log(`Processing call with ID: ${this.call.callId} from phone: ${this.call.phone}`);
    if (hasPermission(this.user, 'seminarAttendanceYemot')) {
      if (this.isManagerCall()) {
        await this.processManagerReportCall();
      } else {
        await this.processSeminarAttendanceCall();
      }
    } else {
      await this.processTransportationCall();
    }
  }

  private isManagerCall(): boolean {
    const managerPhone = this.user.additionalData?.managerPhone;
    return Boolean(managerPhone) && managerPhone === this.call.phone;
  }

  private async processManagerReportCall(): Promise<void> {
    const todayDateOnly = this.getIsraelDateString(new Date());

    const schedules = await this.dataSource.getRepository(LessonSchedule).find({
      where: { userId: this.user.id, scheduleDate: todayDateOnly as unknown as Date },
    });
    if (schedules.length === 0) {
      await this.hangupWithMessageByKey('MANAGER.NO_SCHEDULE_TODAY');
      return;
    }

    const teacherIds = [...new Set(schedules.map((schedule) => schedule.teacherReferenceId))];
    const teachers = await this.dataSource.getRepository(Teacher).findBy({ userId: this.user.id, id: In(teacherIds) });

    const reportedRows = await this.dataSource
      .getRepository(AttReport)
      .createQueryBuilder('att_report')
      .select('DISTINCT att_report.teacherReferenceId', 'teacherReferenceId')
      .where('att_report.userId = :userId', { userId: this.user.id })
      .andWhere('att_report.reportDate = :reportDate', { reportDate: todayDateOnly })
      .andWhere('att_report.teacherReferenceId IN (:...teacherIds)', { teacherIds })
      .getRawMany<{ teacherReferenceId: number }>();
    const reportedTeacherIds = new Set(reportedRows.map((row) => row.teacherReferenceId));

    const reportedNames = teachers.filter((teacher) => reportedTeacherIds.has(teacher.id)).map((teacher) => teacher.name);
    const notReportedNames = teachers.filter((teacher) => !reportedTeacherIds.has(teacher.id)).map((teacher) => teacher.name);

    await this.hangupWithMessageByKey('MANAGER.REPORT_STATUS_TODAY', {
      reportedList: reportedNames.length ? reportedNames.join(', ') : 'אין',
      notReportedList: notReportedNames.length ? notReportedNames.join(', ') : 'כולן',
    });
  }

  private async processTransportationCall(): Promise<void> {
    if (await this.isPastReportingDeadline()) {
      await this.hangupWithMessageByKey('SYSTEM.CLOSED');
      return;
    }
    const student = await this.getStudentByInput();
    if (!student) return;
    const alreadyReported = await this.hasReportedToday(student.id);
    if (alreadyReported) {
      await this.hangupWithMessageByKey('STUDENT.ALREADY_REPORTED');
      return;
    }
    const transportation = await this.getTransportByInput();
    if (!transportation) return;
    const isValid = await this.isDepartureTimeValid(transportation);
    if (isValid) {
      await this.createAbsenceRecord(student, transportation);
      await this.hangupWithMessageByKey('SYSTEM.REPORT_SUCCESS');
    } else {
      await this.hangupWithMessageByKey('SYSTEM.LATE_DEPARTURE');
    }
  }

  private async processSeminarAttendanceCall(): Promise<void> {
    const teacher = await this.getTeacherByPhone();
    if (!teacher) return;

    const schedule = await this.getScheduleForTeacherNow(teacher);
    let klass: Klass = null;
    let lessonReferenceId: number | undefined;
    if (schedule) {
      klass = await this.dataSource.getRepository(Klass).findOneBy({ id: schedule.klassReferenceId });
      lessonReferenceId = schedule.lessonReferenceId;
    }
    if (!klass) {
      klass = await this.getKlassByInput();
    }

    const alreadyReported = await this.hasReportedTodayForKlass(klass.id);
    if (alreadyReported) {
      await this.hangupWithMessageByKey('SEMINAR.ALREADY_REPORTED');
      return;
    }

    const roster = await this.getKlassRoster(klass.id);
    if (roster.length === 0) {
      await this.hangupWithMessageByKey('SEMINAR.NO_STUDENTS_IN_KLASS');
      return;
    }

    const absentStudentReferenceIds = await this.collectAbsentStudentIds();
    await this.saveSeminarAttendance(teacher, klass, roster, absentStudentReferenceIds, lessonReferenceId);
    await this.hangupWithMessageByKey('SYSTEM.REPORT_SUCCESS');
  }

  private async getScheduleForTeacherNow(teacher: Teacher): Promise<LessonSchedule | null> {
    const todayDateOnly = this.getIsraelDateString(new Date());
    const schedules = await this.dataSource.getRepository(LessonSchedule).find({
      where: {
        userId: this.user.id,
        teacherReferenceId: teacher.id,
        scheduleDate: todayDateOnly as unknown as Date,
      },
    });
    if (schedules.length === 0) return null;

    const nowMinutes = this.getIsraelMinutesSinceMidnight(new Date());
    let closest: LessonSchedule | null = null;
    let closestDiff = Infinity;
    for (const schedule of schedules) {
      if (!schedule.startTime) continue;
      const diff = Math.abs(this.timeStringToMinutes(schedule.startTime) - nowMinutes);
      if (diff < closestDiff) {
        closestDiff = diff;
        closest = schedule;
      }
    }
    return closestDiff <= SCHEDULE_MATCH_TOLERANCE_MINUTES ? closest : null;
  }

  private getIsraelMinutesSinceMidnight(date: Date): number {
    const timeString = date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jerusalem', hour12: false });
    return this.timeStringToMinutes(timeString);
  }

  private timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async getTeacherByPhone(): Promise<Teacher | null> {
    const teacher = await this.dataSource.getRepository(Teacher).findOne({
      where: [
        { userId: this.user.id, phone: this.call.phone },
        { userId: this.user.id, phone2: this.call.phone },
      ],
    });
    if (!teacher) {
      await this.hangupWithMessageByKey('TEACHER.PHONE_NOT_RECOGNIZED');
      return null;
    }
    return teacher;
  }

  private async getKlassByInput(): Promise<Klass> {
    let klass: Klass = null;
    while (!klass) {
      const key = await this.askForInputByKey('SEMINAR.KLASS_PROMPT');
      klass = await this.dataSource.getRepository(Klass).findOneBy({
        userId: this.user.id,
        key: Number(key),
        year: getCurrentHebrewYear(),
      });
      if (!klass) {
        await this.sendMessageByKey('SEMINAR.INVALID_KLASS');
      }
    }
    return klass;
  }

  private getIsraelDateString(date: Date): string {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  }

  private async hasReportedTodayForKlass(klassReferenceId: number): Promise<boolean> {
    const todayDateOnly = this.getIsraelDateString(new Date());

    const existingReport = await this.dataSource.getRepository(AttReport).findOne({
      where: {
        userId: this.user.id,
        klassReferenceId,
        reportDate: todayDateOnly as unknown as Date,
      },
    });
    return !!existingReport;
  }

  private async getKlassRoster(klassReferenceId: number): Promise<StudentKlass[]> {
    return this.dataSource.getRepository(StudentKlass).find({
      where: {
        userId: this.user.id,
        klassReferenceId,
        year: getCurrentHebrewYear(),
      },
    });
  }

  private async collectAbsentStudentIds(): Promise<Set<number>> {
    const absentStudentReferenceIds = new Set<number>();
    let input = await this.askForInputByKey('SEMINAR.ABSENT_STUDENT_PROMPT');
    while (input !== '0') {
      const student = await this.dataSource.getRepository(Student).findOneBy({
        userId: this.user.id,
        studentNumber: input,
      });
      if (!student) {
        await this.sendMessageByKey('SEMINAR.INVALID_STUDENT_NUM');
      } else {
        const nameConfirmed = await this.askConfirmation('SEMINAR.CONFIRM_STUDENT_NAME', { studentName: student.name });
        if (nameConfirmed) {
          absentStudentReferenceIds.add(student.id);
        } else {
          await this.sendMessageByKey('SEMINAR.STUDENT_NAME_REJECTED');
        }
      }
      input = await this.askForInputByKey('SEMINAR.ABSENT_STUDENT_PROMPT');
    }
    return absentStudentReferenceIds;
  }

  private async saveSeminarAttendance(
    teacher: Teacher,
    klass: Klass,
    roster: StudentKlass[],
    absentStudentReferenceIds: Set<number>,
    lessonReferenceId?: number,
  ): Promise<void> {
    const now = new Date();
    const reportDate = this.getIsraelDateString(now) as unknown as Date;
    const callTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jerusalem', hour12: false });

    await this.dataSource.transaction(async (manager) => {
      let reportGroupSessionId: number | undefined;

      if (hasPermission(this.user, 'lessonSignature')) {
        const reportGroup = await manager.getRepository(ReportGroup).save({
          userId: this.user.id,
          name: `נוכחות סמינר - ${klass.name}`,
          topic: 'נוכחות סמינר',
          teacherReferenceId: teacher.id,
          klassReferenceId: klass.id,
          year: getCurrentHebrewYear(),
        });

        const reportGroupSession = await manager.getRepository(ReportGroupSession).save({
          userId: this.user.id,
          reportGroupId: reportGroup.id,
          sessionDate: reportDate,
          startTime: callTime,
        });

        reportGroupSessionId = reportGroupSession.id;
      }

      const attReportRepo = manager.getRepository(AttReport);
      const rows = roster.map((studentKlass) =>
        attReportRepo.create({
          userId: this.user.id,
          studentReferenceId: studentKlass.studentReferenceId,
          teacherReferenceId: teacher.id,
          klassReferenceId: klass.id,
          lessonReferenceId,
          reportGroupSessionId,
          reportDate,
          absCount: absentStudentReferenceIds.has(studentKlass.studentReferenceId) ? 1 : 0,
        }),
      );
      await attReportRepo.save(rows);
    });
  }

  private isPastReportingDeadline(): boolean {
    const now = new Date();
    const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));

    const hour = israelTime.getHours();
    const minute = israelTime.getMinutes();

    return hour > 8 || (hour === 8 && minute >= 50);
  }
  private async getStudentByInput(): Promise<Student> {
    let student = null;
    while (!student) {
      student = await this.getStudentByTz();

      if (!student) {
        await this.sendMessageByKey('STUDENT.INVALID_TZ');
      }
    }
    return student;
  }
  private async getStudentByTz(): Promise<Student> {
    const tz = await this.askForInputByKey('STUDENT.TZ_PROMPT');
    const student = await this.dataSource.getRepository(Student).findOneBy({
      userId: this.user.id,
      tz: tz,
    });
    return student;
  }

  private async hasReportedToday(studentId: number): Promise<boolean> {
    const absenceRepo = this.dataSource.getRepository(KnownAbsence);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingReport = await absenceRepo.findOne({
      where: {
        userId: this.user.id,
        studentReferenceId: studentId,
        reportDate: Between(startOfDay, endOfDay),
      },
    });
    return !!existingReport;
  }

  private async getTransportByInput(): Promise<Transportation> {
    let transportation = null;

    while (!transportation) {
      transportation = await this.getTransportByNum();

      if (!transportation) {
        await this.sendMessageByKey('TRANSPORT.INVALID_NUM');
      }
    }

    return transportation;
  }

  private async getTransportByNum(): Promise<Transportation> {
    const num = await this.askForInputByKey('TRANSPORT.NUM_PROMPT');
    const transportation = await this.dataSource.getRepository(Transportation).findOneBy({
      userId: this.user.id,
      key: Number(num),
    });
    return transportation;
  }

  private async isDepartureTimeValid(transportation: Transportation): Promise<boolean> {
    return this.askConfirmation('TRANSPORT.DEPARTURE_CONFIRM', { departureTime: transportation.departureTime });
  }

  private async createAbsenceRecord(student: Student, transportation: Transportation) {
    const absenceRepo = this.dataSource.getRepository(KnownAbsence);
    const studentKlass = await this.dataSource.getRepository(StudentKlass).findOneBy({
      userId: this.user.id,
      studentReferenceId: student.id,
    });
    if (!studentKlass) {
      await this.hangupWithMessageByKey('STUDENT.NO_CLASS');
      return;
    }
    const newAbsence = absenceRepo.create({
      userId: this.user.id,
      studentTz: student.tz,
      studentReferenceId: student.id,
      reportDate: new Date(),
      absnceCount: 1,
      isApproved: true,
      comment: `איחור של הסעה  ${transportation.key}`,
      klassReferenceId: studentKlass.klassReferenceId,
    });
    await absenceRepo.save(newAbsence);
  }
}
