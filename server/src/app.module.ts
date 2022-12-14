import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { RequestContextModule } from 'nestjs-request-context';
import { UserModule } from './entity-modules/user.module';
import { AttReportModule } from './entity-modules/att_report.module';
import { GradeModule } from './entity-modules/grade.module';
import { KlassModule } from './entity-modules/klass.module';
import { KlassTypeModule } from './entity-modules/klass_type.module';
import { KnownAbsenceModule } from './entity-modules/known_absence.module';
import { LessonModule } from './entity-modules/lesson.module';
import { StudentKlassModule } from './entity-modules/student_klass.module';
import { StudentModule } from './entity-modules/student.module';
import { TeacherModule } from './entity-modules/teacher.module';
import { TextModule } from './entity-modules/text.module';
import { StudentKlassReportModule } from './entity-modules/student_klass_report.module';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotCallModule } from '@shared/yemot/yemot-call.module';
import { YemotProccessorImpl } from './yemot.proccessor';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    RequestContextModule,
    UserModule,
    AttReportModule,
    GradeModule,
    KlassModule,
    KlassTypeModule,
    KnownAbsenceModule,
    LessonModule,
    StudentKlassModule,
    StudentModule,
    TeacherModule,
    TextModule,
    StudentKlassReportModule,
    AuthModule,
    YemotCallModule.register(new YemotProccessorImpl())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
