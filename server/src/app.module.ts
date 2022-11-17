import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import TypeOrmModule from './typeorm.module';
import { UsersModule } from './users/users.module';
import { AttReportsModule } from './att_reports/att_reports.module';
import { GradesModule } from './grades/grades.module';
import { KlassesModule } from './klasses/klasses.module';
import { KlassTypesModule } from './klass_types/klass_types.module';
import { KnownAbsencesModule } from './known_absences/known_absences.module';
import { LessonsModule } from './lessons/lessons.module';
import { StudentKlassesModule } from './student_klasses/student_klasses.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { TextsModule } from './texts/texts.module';
import { StudentKlassesReportModule } from './student_klasses_report/student_klasses_report.module';
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
