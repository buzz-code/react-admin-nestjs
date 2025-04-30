import { YemotCall } from "@shared/entities/YemotCall.entity";
import { Between, DataSource, In } from "typeorm";
import { YemotRequest, ReportType } from "../../shared/utils/yemot/yemot.interface";
import { Lesson } from "../db/entities/Lesson.entity";
import { Klass } from "../db/entities/Klass.entity";
import { Teacher } from "../db/entities/Teacher.entity";
import { StudentKlass } from "../db/entities/StudentKlass.entity";
import { AttReport } from "../db/entities/AttReport.entity";
import { Grade } from "../db/entities/Grade.entity";
import { getCurrentHebrewYear } from "../../shared/utils/entity/year.util";

export class YemotRequestImpl extends YemotRequest {
  constructor(
    activeCall: YemotCall,
    dataSource: DataSource,
  ) {
    super(activeCall, dataSource);
  }

  async getLessonFromLessonId(lessonId: number) {
    return this.dataSource.getRepository(Lesson).findOneBy({
      userId: this.getUserId(),
      key: lessonId,
      year: getCurrentHebrewYear(),
    });
  }

  async getKlassByKlassId(klassKey: number, klassId?: number) {
    if (!!klassId) {
      return this.dataSource.getRepository(Klass).findOneBy({
        id: klassId,
      });
    }
    return this.dataSource.getRepository(Klass).findOneBy({
      userId: this.getUserId(),
      key: klassKey,
      year: getCurrentHebrewYear(),
    });
  }

  async getTeacherByPhone(phone: string) {
    return this.dataSource.getRepository(Teacher).findOne({
      where: [
        { userId: this.getUserId(), phone },
        { userId: this.getUserId(), phone2: phone },
      ]
    });
  }

  async getStudentsByKlassId(klassId: number) {
    const res = await this.dataSource.getRepository(StudentKlass).find({
      where: {
        userId: this.getUserId(),
        klassReferenceId: klassId,
        year: getCurrentHebrewYear(),
      },
      relations: {
        student: true,
      },
      order: {
        student: {
          name: 'ASC',
        }
      }
    });

    return res.map(item => item.student).filter(Boolean);
  }

  async saveReport(reportData: AttReport | Grade, type: ReportType) {
    const reportEntity = type === 'att' ? AttReport : Grade;
    const reportRepo = this.dataSource.getRepository(reportEntity);

    const report = reportRepo.create(reportData)
    await reportRepo.save(report);

    return report;
  }

  getExistingAttReports(klassId: string, lessonId: string, sheetName: string): Promise<AttReport[]> {
    return this.dataSource.getRepository(AttReport).findBy({
      userId: this.getUserId(),
      sheetName,
      lessonReferenceId: Number(lessonId),
      klassReferenceId: Number(klassId),
      year: getCurrentHebrewYear(),
    })
  }

  getExistingGradeReports(klassId: string, lessonId: string, sheetName: string): Promise<Grade[]> {
    return this.dataSource.getRepository(Grade).findBy({
      userId: this.getUserId(),
      lessonReferenceId: Number(lessonId),
      klassReferenceId: Number(klassId),
      year: getCurrentHebrewYear(),
      reportDate: Between(new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000), new Date())
    })
  }

  async deleteExistingReports(existingReports: (AttReport | Grade)[], type: ReportType) {
    if (existingReports.length) {
      const entity = type === 'att' ? AttReport : Grade;
      await this.dataSource.getRepository(entity)
        .delete({
          id: In(existingReports.map(item => item.id))
        });
    }
  }
}