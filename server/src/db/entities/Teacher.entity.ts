import {
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
import { IsOptional } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, MaxLength } from "@shared/utils/validation/class-validator-he";

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

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(10, { always: true })
  @Column("varchar", { name: "tz", length: 10 })
  tz: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(10, { always: true })
  @Column("varchar", { name: "phone", nullable: true, length: 10 })
  phone: string | null;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(10, { always: true })
  @Column("varchar", { name: "phone2", nullable: true, length: 10 })
  phone2: string | null;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "email", nullable: true, length: 500 })
  email: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.teachers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
