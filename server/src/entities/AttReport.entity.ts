import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { Student } from "./Student.entity";
import { Teacher } from "./Teacher.entity";

@Index("att_users_idx", ["userId"], {})
@Entity("att_reports")
export class AttReport {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

  @Column("varchar", { name: "teacher_id", length: 10 })
  teacherId: string;

  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @Column("int", { name: "lesson_id" })
  lessonId: number;

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

  @ManyToOne(() => Student)
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "student_tz", referencedColumnName: "tz" }
  ])
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "teacher_id", referencedColumnName: "tz" }
  ])
  teacher: Teacher;

  @ManyToOne(() => Lesson)
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "lesson_id", referencedColumnName: "key" }
  ])
  lesson: Lesson;

  @ManyToOne(() => Klass)
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "klass_id", referencedColumnName: "key" }
  ])
  klass: Klass;
}
