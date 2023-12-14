import { CrudValidationGroups } from "@dataui/crud";
import { IsOptional } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty, MaxLength } from "@shared/utils/validation/class-validator-he";
import { Type } from "class-transformer";


export enum ReportMonthSemester {
  first = 'א',
  second = 'ב',
  fullYear = 'שנתי',
}

@Entity()
export class ReportMonth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  @Type(() => Date)
  @Index()
  startDate: Date;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  @Type(() => Date)
  @Index()
  endDate: Date;

  @IsOptional({ always: true })
  @MaxLength(255, { always: true })
  @Column({ default: ReportMonthSemester.fullYear })
  semester: ReportMonthSemester;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
