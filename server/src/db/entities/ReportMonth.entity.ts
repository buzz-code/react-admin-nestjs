import { CrudValidationGroups } from "@dataui/crud";
import { IsOptional } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty, MaxLength } from "@shared/utils/validation/class-validator-he";


@Entity()
export class ReportMonth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  startDate: Date;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
