import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import TypeOrmModule from './typeorm.module';
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


@Module({
  imports: [
    TypeOrmModule,
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
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
