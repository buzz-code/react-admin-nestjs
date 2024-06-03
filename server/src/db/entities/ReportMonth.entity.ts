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
import { DateType, StringType } from "@shared/utils/entity/class-transformer";


export enum ReportMonthSemester {
  first = 'א',
  second = 'ב',
  fullYear = 'שנתי',
}

@Index("report_month_user_id_start_date_end_date_idx", ["userId", "startDate", "endDate"], {})
@Entity()
export class ReportMonth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index("report_month_user_id_idx")
  userId: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  @DateType
  @Index("report_month_start_date_idx")
  startDate: Date;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  @DateType
  @Index("report_month_end_date_idx")
  endDate: Date;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ default: ReportMonthSemester.fullYear })
  semester: ReportMonthSemester;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
