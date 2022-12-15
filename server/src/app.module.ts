import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { RequestContextModule } from 'nestjs-request-context';
import { UserModule } from 'src/entity-modules/user.module';
import { AttReportModule } from 'src/entity-modules/att_report.module';
import { GradeModule } from 'src/entity-modules/grade.module';
import { KlassModule } from 'src/entity-modules/klass.module';
import { KlassTypeModule } from 'src/entity-modules/klass_type.module';
import { KnownAbsenceModule } from 'src/entity-modules/known_absence.module';
import { LessonModule } from 'src/entity-modules/lesson.module';
import { StudentKlassModule } from 'src/entity-modules/student_klass.module';
import { StudentModule } from 'src/entity-modules/student.module';
import { TeacherModule } from 'src/entity-modules/teacher.module';
import { TextModule } from 'src/entity-modules/text.module';
import { StudentKlassReportModule } from 'src/entity-modules/student_klass_report.module';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotCallModule } from '@shared/yemot/yemot-call.module';
import { YemotProccessorImpl } from 'src/yemot.proccessor';


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
