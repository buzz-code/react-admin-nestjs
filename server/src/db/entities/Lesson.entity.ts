import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  In,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "./Teacher.entity";
import { Klass } from "./Klass.entity";
import { KlassType } from "./KlassType.entity";
import { User } from "./User.entity";
import { findManyAndAssignReferenceIds, findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { IsOptional } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsUniqueCombination, MaxLength } from "@shared/utils/validation/class-validator-he";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { Type } from "class-transformer";

@Index("lessons_users_idx", ["userId"], {})
@Index(["userId", "key", "year"], { unique: true })
@Entity("lessons")
export class Lesson implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Teacher, Klass, KlassType, User]);

      const klassesArray = (typeof this.klasses === 'string' && this.klasses.includes(',')) ? this.klasses.split(',') : [this.klasses];
      this.klassReferenceIds = await findManyAndAssignReferenceIds(
        dataSource, Klass, { year: this.year, key: In(klassesArray) }, this.userId, this.klassReferenceIds, this.klasses
      );

      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource, Teacher, { tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @IsUniqueCombination(['userId'], [Lesson, Teacher, User], { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Type(() => String)
  @IsOptional({ always: true })
  @MaxLength(450, { always: true })
  @Column("varchar", { name: "klasses", nullable: true, length: 450 })
  klasses: string | null;

  @Column("simple-array", { nullable: true })
  klassReferenceIds: number[];

  @Column("varchar", { name: "teacher_id", length: 10, nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  teacherReferenceId: number;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

  @IsOptional({ always: true })
  @MaxLength(1000, { always: true })
  @Column("varchar", { name: "comment", nullable: true, length: 1000 })
  comment: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
