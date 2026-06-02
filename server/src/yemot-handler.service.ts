import { Injectable } from '@nestjs/common';
import { BaseYemotHandlerService } from '@shared/utils/yemot/v2/yemot-router.service';
import { Student } from './db/entities/Student.entity';
import { Transportation } from './db/entities/Transportation.entity';
import { KnownAbsence } from './db/entities/KnownAbsence.entity';
import { StudentKlass } from './db/entities/StudentKlass.entity';
import { Between } from 'typeorm';
/**
 * Yemot Handler Service for processing incoming Yemot calls
 * Currently returns a maintenance mode message
 */

@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  override async processCall(): Promise<void> {
    await this.getUserByDidPhone();
    this.logger.log(`Processing call with ID: ${this.call.callId} from phone: ${this.call.phone}`);
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
