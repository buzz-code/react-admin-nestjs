import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { IsOptional } from "class-validator";
import { IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { CrudValidationGroups } from "@dataui/crud";
import { Type } from "class-transformer";

@Entity("grade_names")
export class GradeName implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  @Index()
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;
}
