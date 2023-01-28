import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "./Teacher.entity";

@Index("lessons_users_idx", ["userId"], {})
@Index(["userId", "key"], { unique: true })
@Entity("lessons")
export class Lesson implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "key" })
  key: number;

  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column("varchar", { name: "klasses", nullable: true, length: 450 })
  klasses: string | null;

  @Column("varchar", { name: "teacher_id", length: 10 })
  teacherId: string;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

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

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "teacher_id", referencedColumnName: "tz" }
  ])
  teacher: Teacher;
}
