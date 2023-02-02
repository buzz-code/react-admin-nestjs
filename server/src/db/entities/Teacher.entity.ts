import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { User } from "src/db/entities/User.entity";

@Index("teachers_users_idx", ["userId"], {})
@Index(["userId", "tz", "year"], { unique: true })
@Entity("teachers")
export class Teacher implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "tz", length: 10 })
  tz: string;

  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column("varchar", { name: "phone", nullable: true, length: 10 })
  phone: string | null;

  @Column("varchar", { name: "phone2", nullable: true, length: 10 })
  phone2: string | null;

  @Column("varchar", { name: "email", nullable: true, length: 500 })
  email: string | null;

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

  @ManyToOne(() => User, (user) => user.teachers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
