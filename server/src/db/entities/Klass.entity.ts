import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { User } from "./User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { IsNotEmpty, MaxLength, ValidateIf } from "class-validator";

@Index("klasses_users_idx", ["userId"], {})
@Index(["userId", "key", "year"], { unique: true })
@Entity("klasses")
export class Klass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
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

  @IsNotEmpty({ always: true })
  @Column("int", { name: "key" })
  key: number;

  @IsNotEmpty({ always: true })
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @ValidateIf((attReport: Klass) => !Boolean(attReport.klassTypeReferenceId), { always: true })
  @IsNotEmpty({ always: true })
  @Column("int", { name: "klass_type_id", nullable: true })
  klassTypeId: number | null;

  @ValidateIf((attReport: Klass) => !Boolean(attReport.klassTypeId), { always: true })
  @IsNotEmpty({ always: true })
  @Column({ nullable: true })
  klassTypeReferenceId: number;

  @Column("varchar", { name: "teacher_id", nullable: true, length: 10 })
  teacherId: string | null;

  @Column({ nullable: true })
  teacherReferenceId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => KlassType, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassTypeReferenceId' })
  klassType: KlassType;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
