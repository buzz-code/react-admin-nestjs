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
import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";


@Index("texts_users_idx", ["userId"], {})
@Entity("texts")
export class Text implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(100, { always: true })
  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(100, { always: true })
  @Column("varchar", { name: "description", length: 100 })
  description: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(10000, { always: true })
  @Column("varchar", { name: "value", length: 10000 })
  value: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.texts, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
