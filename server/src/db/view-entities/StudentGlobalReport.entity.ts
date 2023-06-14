import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "../entities/Student.entity";
import { AttReportAndGrade } from "./AttReportAndGrade.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";

@ViewEntity("student_global_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(studentReferenceId, "_", teacherReferenceId, "_", klassReferenceId, "_", lessonReferenceId)', 'id')
    .addSelect('user_id')
    .addSelect('year')
    .addSelect('studentReferenceId')
    .addSelect('teacherReferenceId')
    .addSelect('klassReferenceId')
    .addSelect('lessonReferenceId')
    .addSelect('SUM(how_many_lessons)', 'lessons_count')
    .addSelect('SUM(abs_count)', 'abs_count')
    .addSelect('AVG(grade)', 'grade_avg')
    .from(AttReportAndGrade, 'atag')
    .groupBy('studentReferenceId')
    .addGroupBy('teacherReferenceId')
    .addGroupBy('klassReferenceId')
    .addGroupBy('lessonReferenceId')
    .addGroupBy('user_id')
    .addGroupBy('year')
})
export class StudentGlobalReport implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column()
  studentReferenceId: number;

  @Column()
  klassReferenceId: number;

  @Column()
  lessonReferenceId: number;

  @Column()
  teacherReferenceId: number;

  @Column({ name: 'lessons_count' })
  lessonsCount: number;

  @Column({ name: 'abs_count' })
  absCount: number;

  @Column({ name: 'grade_avg' })
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
