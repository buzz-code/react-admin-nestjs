import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { Student } from "./Student.entity";
import { Teacher } from "./Teacher.entity";
import { StudentBaseKlass } from "../view-entities/StudentBaseKlass";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { User } from "./User.entity";

@Index("att_users_idx", ["userId"], {})
@Entity("att_reports")
export class AttReport implements IHasUserId {
  @BeforeInsert()
  async fillFields() {
    const dataSource = await getDataSource([Student, Teacher, Klass, Lesson, User]);

    this.studentReferenceId = await findOneAndAssignReferenceId(
      dataSource, Student, { year: this.year, tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
    );
    this.teacherReferenceId = await findOneAndAssignReferenceId(
      dataSource, Teacher, { year: this.year, tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
    );
    this.klassReferenceId = await findOneAndAssignReferenceId(
      dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
    );
    this.lessonReferenceId = await findOneAndAssignReferenceId(
      dataSource, Lesson, { year: this.year, key: this.lessonId }, this.userId, this.lessonReferenceId, this.lessonId
    );
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

  @Column({ nullable: true })
  studentReferenceId: number;

  @Column("varchar", { name: "teacher_id", length: 10 })
  teacherId: string;

  @Column({ nullable: true })
  teacherReferenceId: number;

  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @Column({ nullable: true })
  klassReferenceId: number;

  @Column("int", { name: "lesson_id" })
  lessonId: number;

  @Column({ nullable: true })
  lessonReferenceId: number;

  @Column("date", { name: "report_date" })
  reportDate: string;

  @Column("int", { name: "how_many_lessons", nullable: true })
  howManyLessons: number | null;

  @Column("int", { name: "abs_count", default: () => "'0'" })
  absCount: number;

  @Column("int", { name: "approved_abs_count", default: () => "'0'" })
  approvedAbsCount: number;

  @Column("varchar", { name: "comments", nullable: true, length: 500 })
  comments: string | null;

  @Column("varchar", { name: "sheet_name", nullable: true, length: 100 })
  sheetName: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "student_tz", referencedColumnName: "tz" }
  ])
  student: Student;

  @ManyToOne(() => StudentBaseKlass, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "student_tz", referencedColumnName: "tz" }
  ])
  studentBaseKlass: StudentBaseKlass;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "teacher_id", referencedColumnName: "tz" }
  ])
  teacher: Teacher;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "lesson_id", referencedColumnName: "key" }
  ])
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "klass_id", referencedColumnName: "key" }
  ])
  klass: Klass;
}
