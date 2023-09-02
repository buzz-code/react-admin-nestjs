import { Module } from "@nestjs/common";
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';

import userConfig from './entity-modules/user.config';
import attReportConfig from './entity-modules/att-report.config';
import gradeConfig from './entity-modules/grade.config';
import klassConfig from './entity-modules/klass.config';
import klassTypeConfig from './entity-modules/klass-type.config';
import knownAbsenceConfig from './entity-modules/known-absence.config';
import lessonConfig from './entity-modules/lesson.config';
import studentKlassConfig from './entity-modules/student-klass.config';
import studentConfig from './entity-modules/student.config';
import teacherConfig from './entity-modules/teacher.config';
import textConfig from './entity-modules/text.config';
import studentKlassReportConfig from './entity-modules/student-klass-report.config';
import { StudentBaseKlass } from './db/view-entities/StudentBaseKlass.entity';
import { AuditLog } from '@shared/entities/AuditLog.entity';
import { ImportFile } from '@shared/entities/ImportFile.entity';
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { TextByUser } from '@shared/view-entities/TextByUser.entity';
import mailAddressConfig from '@shared/utils/mail/mail-address.config';
import { RecievedMail } from '@shared/entities/RecievedMail.entity';
import { Image } from "@shared/entities/Image.entity";
import pageConfig from './entity-modules/page.config';
import { ReportMonth } from './db/entities/ReportMonth.entity';
import teacherReportStatusConfig from './entity-modules/teacher-report-status.config';
import studentPercentReportConfig from './entity-modules/student-percent-report.config';
import { AttReportAndGrade } from "./db/view-entities/AttReportAndGrade.entity";
import { StudentGlobalReport } from "./db/view-entities/StudentGlobalReport.entity";
import { StudentByYear } from "./db/view-entities/StudentByYear.entity";

@Module({
    imports: [
        BaseEntityModule.register(userConfig),
        BaseEntityModule.register(attReportConfig),
        BaseEntityModule.register(gradeConfig),
        BaseEntityModule.register(klassConfig),
        BaseEntityModule.register(klassTypeConfig),
        BaseEntityModule.register(knownAbsenceConfig),
        BaseEntityModule.register(lessonConfig),
        BaseEntityModule.register(studentKlassConfig),
        BaseEntityModule.register(studentConfig),
        BaseEntityModule.register(teacherConfig),
        BaseEntityModule.register(textConfig),
        BaseEntityModule.register(studentKlassReportConfig),
        BaseEntityModule.register({ entity: StudentBaseKlass }),
        BaseEntityModule.register({ entity: AuditLog }),
        BaseEntityModule.register({ entity: ImportFile }),
        BaseEntityModule.register({ entity: YemotCall }),
        BaseEntityModule.register(mailAddressConfig),
        BaseEntityModule.register({ entity: RecievedMail }),
        BaseEntityModule.register(pageConfig),
        BaseEntityModule.register({ entity: ReportMonth }),
        BaseEntityModule.register(teacherReportStatusConfig),
        BaseEntityModule.register({ entity: TextByUser }),
        BaseEntityModule.register(studentPercentReportConfig),
        BaseEntityModule.register({ entity: AttReportAndGrade }),
        BaseEntityModule.register({ entity: StudentGlobalReport }),
        BaseEntityModule.register({ entity: Image }),
        BaseEntityModule.register({ entity: StudentByYear }),
    ]
})
export class EntitiesModule { }