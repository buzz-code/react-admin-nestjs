import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotModule } from '@shared/utils/yemot/yemot.module';
// import { yemotProcessorProvider } from 'src/yemot.processor';
import yemotChain from './yemot/yemot.chain';
import { MailSendModule } from '@shared/utils/mail/mail-send.module';
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
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { MailAddress } from '@shared/entities/MailAddress.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    RequestContextModule,
    MailSendModule,
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
    BaseEntityModule.register({ entity: MailAddress }),
    AuthModule,
    YemotModule.register(yemotChain)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
