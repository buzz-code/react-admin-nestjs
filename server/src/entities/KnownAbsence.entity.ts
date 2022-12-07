import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../common/entities/User.entity";

@Index("known_users_idx", ["userId"], {})
@Entity("known_absences")
export class KnownAbsence {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

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

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", { name: "id_copy1", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @ManyToOne(() => User, (users) => users.knownAbsences, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
