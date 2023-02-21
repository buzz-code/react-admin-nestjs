import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotCallModule } from '@shared/utils/yemot/yemot-call.module';
import { YemotProccessorImpl } from 'src/yemot.proccessor';
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
import { StudentBaseKlass } from './db/view-entities/StudentBaseKlass';
import { AuditLog } from '@shared/entities/AuditLog.entity';
import { ImportFile } from '@shared/entities/ImportFile.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    RequestContextModule,
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
    AuthModule,
    YemotCallModule.register(new YemotProccessorImpl())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
