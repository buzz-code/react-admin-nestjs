import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";

@Index("klasses_users_idx", ["userId"], {})
@Index(["userId", "key", "year"], { unique: true })
@Entity("klasses")
export class Klass implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("int", { name: "key" })
  key: number;

  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column("int", { name: "klass_type_id", nullable: true })
  klassTypeId: number | null;

  @Column("varchar", { name: "teacher_id", nullable: true, length: 10 })
  teacherId: string | null;

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

  @ManyToOne(() => KlassType)
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "klass_type_id", referencedColumnName: "id" }
  ])
  klassType: KlassType;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "year", referencedColumnName: "year" },
    { name: "teacher_id", referencedColumnName: "tz" }
  ])
  teacher: Teacher;
}
