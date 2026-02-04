import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { IsOptional } from "class-validator";
import { IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { CrudValidationGroups } from "@dataui/crud";
import { NumberType, StringType } from "@shared/utils/entity/class-transformer";
import { CreatedAtColumn, UpdatedAtColumn } from "@shared/utils/entity/column-types.util";

@Entity("grade_names")
export class GradeName implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  @Index("grade_names_user_id_idx")
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "name", length: 500, nullable: true })
  name: string;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;
}
