import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import TypeOrmModule from './typeorm.module';
import { RequestContextModule } from 'nestjs-request-context';
import { UsersModule } from './entity-modules/users.module';
import { AttReportsModule } from './entity-modules/att_reports.module';
import { GradesModule } from './entity-modules/grades.module';
import { KlassesModule } from './entity-modules/klasses.module';
import { KlassTypesModule } from './entity-modules/klass_types.module';
import { KnownAbsencesModule } from './entity-modules/known_absences.module';
import { LessonsModule } from './entity-modules/lessons.module';
import { StudentKlassesModule } from './entity-modules/student_klasses.module';
import { StudentsModule } from './entity-modules/students.module';
import { TeachersModule } from './entity-modules/teachers.module';
import { TextsModule } from './entity-modules/texts.module';
import { StudentKlassesReportModule } from './entity-modules/student_klasses_report.module';
import { AuthModule } from './auth/auth.module';
import { YemotCallModule } from './common/yemot-call.module';
import { YemotProccessorImpl } from './yemot.proccessor';


@Module({
  imports: [
    TypeOrmModule,
    RequestContextModule,
    UsersModule,
    AttReportsModule,
    GradesModule,
    KlassesModule,
    KlassTypesModule,
    KnownAbsencesModule,
    LessonsModule,
    StudentKlassesModule,
    StudentsModule,
    TeachersModule,
    TextsModule,
    StudentKlassesReportModule,
    AuthModule,
    YemotCallModule.register(new YemotProccessorImpl())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
