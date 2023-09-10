import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DataSource,
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
import { MaxCountByUserLimit } from "@shared/utils/validation/max-count-by-user-limit";
import { StudentByYear } from "../view-entities/StudentByYear.entity";
import { PaymentTrack } from "@shared/entities/PaymentTrack.entity";

@Index("student_klasses_users_idx", ["userId"], {})
@Entity("student_klasses")
export class StudentKlass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Klass, User, KlassType, Teacher]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
      );
    } finally {
      dataSource.destroy();
    }
  }

  @MaxCountByUserLimit(StudentByYear, (userId, dataSource: DataSource) =>
    dataSource.getRepository(User).findOne({ where: { id: userId }, select: { paymentTrackId: true } })
      .then(user => user?.paymentTrackId)
      .then(ptid => dataSource.getRepository(PaymentTrack).findOne({ where: { id: ptid }, select: { studentNumberLimit: true } }))
      .then(pt => pt?.studentNumberLimit ?? 0)
    , [User, PaymentTrack], 'studentReferenceId', { always: true, message: 'הגעת להגבלת הכמות לטבלת שיוך תלמידות, אנא פני לאחראית כדי להגדיל את החבילה' })
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

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.studentTz) && Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassId) && Boolean(attReport.klassReferenceId), { always: true })
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
