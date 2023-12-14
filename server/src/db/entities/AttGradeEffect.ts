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
import { IsNotEmpty, IsNumber } from "@shared/utils/validation/class-validator-he";
import { CrudValidationGroups } from "@dataui/crud";
import { Type } from "class-transformer";

@Entity("att_grade_effect")
export class AttGradeEffect implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  @Index()
  userId: number;

  @IsOptional({ always: true })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  percents: number;

  @IsOptional({ always: true })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  count: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column()
  effect: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;
}
