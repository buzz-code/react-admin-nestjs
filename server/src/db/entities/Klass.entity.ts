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
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { User } from "./User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";

@Index("klasses_users_idx", ["userId"], {})
@Index(["userId", "key", "year"], { unique: true })
@Entity("klasses")
export class Klass implements IHasUserId {
  @BeforeInsert()
  async fillFields() {
    const dataSource = await getDataSource([KlassType, Teacher, User]);

    this.klassTypeReferenceId = await findOneAndAssignReferenceId(
      dataSource, KlassType, { id: this.klassTypeId }, this.userId, this.klassTypeReferenceId, this.klassTypeId
    );
    this.teacherReferenceId = await findOneAndAssignReferenceId(
      dataSource, Teacher, { year: this.year, tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
    );
  }

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

  @Column({ nullable: true })
  klassTypeReferenceId: number;

  @Column("varchar", { name: "teacher_id", nullable: true, length: 10 })
  teacherId: string | null;

  @Column({ nullable: true })
  teacherReferenceId: number;

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

  @ManyToOne(() => KlassType, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassTypeReferenceId' })
  klassType: KlassType;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
