import { Module } from '@nestjs/common';
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';
import { createSharedEntitiesImports } from '@shared/entities/createSharedEntitiesImports';
import attReportConfig from './entity-modules/att-report.config';
import gradeConfig from './entity-modules/grade.config';
import klassConfig from './entity-modules/klass.config';
import klassTypeConfig from './entity-modules/klass-type.config';
import knownAbsenceConfig from './entity-modules/known-absence.config';
import lessonConfig from './entity-modules/lesson.config';
import lessonScheduleConfig from './entity-modules/lesson-schedule.config';
import studentKlassConfig from './entity-modules/student-klass.config';
import studentConfig from './entity-modules/student.config';
import teacherConfig from './entity-modules/teacher.config';
import studentKlassReportConfig from './entity-modules/student-klass-report.config';
import { StudentBaseKlass } from './db/view-entities/StudentBaseKlass.entity';
import { createAuditLogConfig } from '@shared/entities/configs/audit-log.config';
import { registerEntityNameMap } from '@shared/entities/configs/import-file.config';
import { ReportMonth } from './db/entities/ReportMonth.entity';
import teacherReportStatusConfig from './entity-modules/teacher-report-status.config';
import studentPercentReportConfig from './entity-modules/student-percent-report.config';
import { AttReportAndGrade } from './db/view-entities/AttReportAndGrade.entity';
import { StudentGlobalReport } from './db/view-entities/StudentGlobalReport.entity';
import studentByYearConfig from './entity-modules/student-by-year.config';
import teacherSalaryReportConfig from './entity-modules/teacher-salary-report.config';
import attReportWithReportMonthConfig from './entity-modules/att-report-with-report-month.config';
import { KnownAbsenceWithReportMonth } from './db/view-entities/KnownAbsenceWithReportMonth.entity';
import gradeNameConfig from './entity-modules/grade-name.config';
import { AttGradeEffect } from './db/entities/AttGradeEffect';
import teacherGradeReportStatusConfig from './entity-modules/teacher-grade-report-status.config';
import { GradeEffectByUser } from 'src/db/view-entities/GradeEffectByUser.entity';
import { AbsCountEffectByUser } from 'src/db/view-entities/AbsCountEffectByUser.entity';
import { LessonKlassName } from './db/view-entities/LessonKlassName.entity';
import { StudentSpeciality } from './db/view-entities/StudentSpeciality.entity';
import { AttendanceName } from './db/entities/AttendanceName.entity';
import reportGroupConfig from './entity-modules/report-group.config';
import reportGroupSessionConfig from './entity-modules/report-group-session.config';
import transportationConfig from './entity-modules/transportation.config';
import absenceTypeConfig from './entity-modules/absenceType.config';
import uploadedFileConfig from '@shared/entities/configs/uploaded-file.config';
import phoneTemplateConfig from '@shared/entities/configs/phone-template.config';
import phoneCampaignConfig from '@shared/entities/configs/phone-campaign.config';
import { Student } from './db/entities/Student.entity';
import { Teacher } from './db/entities/Teacher.entity';
import userConfig from '@shared/entities/configs/user.config';

registerEntityNameMap({
  att_report: 'נוכחות',
  grade: 'ציונים',
  klass: 'כיתות',
  klass_type: 'שיוך כיתות',
  known_absence: 'חיסורים מאושרים',
  lesson: 'שיעורים',
  lesson_schedule: 'מערכת שעות מורות',
  student_klass: 'שיוך תלמידות לכיתות',
  student: 'תלמידות',
  teacher: 'מורות',
  uploaded_file: 'קבצים שהועלו',
});

@Module({
  imports: [
    ...createSharedEntitiesImports(userConfig),
    BaseEntityModule.register(attReportConfig),
    BaseEntityModule.register(attReportWithReportMonthConfig),
    BaseEntityModule.register(gradeConfig),
    BaseEntityModule.register(klassConfig),
    BaseEntityModule.register(klassTypeConfig),
    BaseEntityModule.register(knownAbsenceConfig),
    BaseEntityModule.register(lessonConfig),
    BaseEntityModule.register(lessonScheduleConfig),
    BaseEntityModule.register(studentKlassConfig),
    BaseEntityModule.register(studentConfig),
    BaseEntityModule.register(teacherConfig),
    BaseEntityModule.register(studentKlassReportConfig),
    BaseEntityModule.register({ entity: StudentBaseKlass }),
    BaseEntityModule.register({ entity: StudentSpeciality }),
    BaseEntityModule.register(createAuditLogConfig({ student: Student, teacher: Teacher })),
    BaseEntityModule.register(reportGroupConfig),
    BaseEntityModule.register(reportGroupSessionConfig),
    BaseEntityModule.register({ entity: ReportMonth }),
    BaseEntityModule.register(teacherReportStatusConfig),
    BaseEntityModule.register(teacherGradeReportStatusConfig),
    BaseEntityModule.register(studentPercentReportConfig),
    BaseEntityModule.register({ entity: AttReportAndGrade }),
    BaseEntityModule.register({ entity: StudentGlobalReport }),
    BaseEntityModule.register(studentByYearConfig),
    BaseEntityModule.register(teacherSalaryReportConfig),
    BaseEntityModule.register({ entity: KnownAbsenceWithReportMonth }),
    BaseEntityModule.register(gradeNameConfig),
    BaseEntityModule.register({ entity: AttendanceName }),
    BaseEntityModule.register({ entity: AttGradeEffect }),
    BaseEntityModule.register({ entity: GradeEffectByUser }),
    BaseEntityModule.register({ entity: AbsCountEffectByUser }),
    BaseEntityModule.register({ entity: LessonKlassName }),
    BaseEntityModule.register(transportationConfig),
    BaseEntityModule.register(absenceTypeConfig),
    BaseEntityModule.register(uploadedFileConfig),
    BaseEntityModule.register(phoneTemplateConfig),
    BaseEntityModule.register(phoneCampaignConfig),
  ],
})
export class EntitiesModule {}
