import {
  BeforeInsert,
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
import { User } from "src/db/entities/User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "./Student.entity";

@Index("known_users_idx", ["userId"], {})
@Entity("known_absences")
export class KnownAbsence implements IHasUserId {
  @BeforeInsert()
  async fillFields() {
    const dataSource = await getDataSource([Student, User]);

    this.studentReferenceId = await findOneAndAssignReferenceId(
      dataSource, Student, { year: this.year, tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
    );
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @Column({ nullable: true })
  studentReferenceId: number;

  @Column("date", { name: "report_date" })
  reportDate: string;

  @Column("int", { name: "absnce_count", nullable: true })
  absnceCount: number | null;

  @Column("int", { name: "absnce_code", nullable: true })
  absnceCode: number | null;

  @Column("varchar", { name: "sender_name", nullable: true, length: 100 })
  senderName: string | null;

  @Column("varchar", { name: "reason", nullable: true, length: 500 })
  reason: string | null;

  @Column("varchar", { name: "comment", nullable: true, length: 500 })
  comment: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.knownAbsences, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
