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
import { Student } from "./Student.entity";
import { Klass } from "./Klass.entity";
import { User } from "./User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty } from "@shared/utils/validation/class-validator-he";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";

@Index("student_klasses_users_idx", ["userId"], {})
@Entity("student_klasses")
export class StudentKlass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
  
    const dataSource = await getDataSource([Student, Klass, User, KlassType, Teacher]);

    this.studentReferenceId = await findOneAndAssignReferenceId(
      dataSource, Student, { year: this.year, tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
    );
    this.klassReferenceId = await findOneAndAssignReferenceId(
      dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
    );
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.studentTz), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  klassReferenceId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
