import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../common/entities/User.entity";

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

  @Column("varchar", { name: "sheet_name", nullable: true, length: 100 })
  sheetName: string | null;

  @ManyToOne(() => User, (users) => users.attReports, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
