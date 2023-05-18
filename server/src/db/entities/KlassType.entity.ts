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

export enum KlassTypeEnum {
  baseKlass = 'כיתת אם',
  track = 'מסלול',
  speciality = 'התמחות',
  other = 'אחר',
}

@Index("klass_types_users_idx", ["userId"], {})
@Entity("klass_types")
export class KlassType implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column('varchar', { default: KlassTypeEnum.other })
  klassTypeEnum: KlassTypeEnum;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.klassTypes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
