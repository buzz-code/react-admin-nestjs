import { DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "../entities/Student.entity";
import { AttReportAndGrade } from "./AttReportAndGrade.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";

@ViewEntity("student_global_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(COALESCE(sgr_inner.studentReferenceId, "null"), "_", COALESCE(sgr_inner.teacherReferenceId, "null"), "_", ' +
      'COALESCE(sgr_inner.klassReferenceId, "null"), "_", COALESCE(sgr_inner.lessonReferenceId, "null"), "_", ' +
      'COALESCE(sgr_inner.user_id, "null"), "_", COALESCE(sgr_inner.year, "null"))', 'id')
    .addSelect('sgr_inner.user_id', 'user_id')
    .addSelect('sgr_inner.year', 'year')
    .addSelect('sgr_inner.studentReferenceId', 'studentReferenceId')
    .addSelect('sgr_inner.teacherReferenceId', 'teacherReferenceId')
    .addSelect('sgr_inner.klassReferenceId', 'klassReferenceId')
    .addSelect('sgr_inner.lessonReferenceId', 'lessonReferenceId')
    .addSelect(`CASE WHEN klass_types.klassTypeEnum = "${KlassTypeEnum.baseKlass}" THEN 1 ELSE 0 END`, 'isBaseKlass')
    .addSelect('sgr_inner.lessons_count', 'lessons_count')
    .addSelect('sgr_inner.abs_count', 'abs_count')
    .addSelect('sgr_inner.grade_avg', 'grade_avg')
    .from(subQuery => subQuery
      .select('atag.user_id', 'user_id')
      .addSelect('atag.year', 'year')
      .addSelect('atag.studentReferenceId', 'studentReferenceId')
      .addSelect('atag.teacherReferenceId', 'teacherReferenceId')
      .addSelect('atag.klassReferenceId', 'klassReferenceId')
      .addSelect('atag.lessonReferenceId', 'lessonReferenceId')
      .addSelect('SUM(atag.how_many_lessons)', 'lessons_count')
      .addSelect('SUM(atag.abs_count)', 'abs_count')
      .addSelect('AVG(atag.grade)', 'grade_avg')
      .from(AttReportAndGrade, 'atag')
      .groupBy('atag.user_id')
      .addGroupBy('atag.year')
      .addGroupBy('atag.studentReferenceId')
      .addGroupBy('atag.teacherReferenceId')
      .addGroupBy('atag.klassReferenceId')
      .addGroupBy('atag.lessonReferenceId'), 'sgr_inner')
    .leftJoin(Klass, 'klasses', 'klasses.id = sgr_inner.klassReferenceId')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
})
export class StudentGlobalReport implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @ViewColumn({ name: "user_id" })
  userId: number;

  @ViewColumn()
  year: number;

  @ViewColumn()
  studentReferenceId: number;

  @ViewColumn()
  klassReferenceId: number;

  @ViewColumn()
  lessonReferenceId: number;

  @ViewColumn()
  teacherReferenceId: number;

  @ViewColumn()
  isBaseKlass: boolean;

  @ViewColumn({ name: 'lessons_count' })
  lessonsCount: number;

  @ViewColumn({ name: 'abs_count' })
  absCount: number;

  @ViewColumn({ name: 'grade_avg' })
  gradeAvg: number;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
