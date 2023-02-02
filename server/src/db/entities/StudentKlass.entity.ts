import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "./Student.entity";
import { Klass } from "./Klass.entity";

@Index("student_klasses_users_idx", ["userId"], {})
@Entity("student_klasses")
export class StudentKlass implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

  @Column("int", { name: "klass_id" })
  klassId: number;

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

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "klass_id", referencedColumnName: "key" }
  ])
  klass: Klass;
}
