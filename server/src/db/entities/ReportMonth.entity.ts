import { CrudValidationGroups } from "@dataui/crud";
import { IsOptional } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNotEmpty, MaxLength } from "@shared/utils/validation/class-validator-he";
import { DateType, StringType } from "@shared/utils/entity/class-transformer";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";


export enum ReportMonthSemester {
  first = 'א',
  second = 'ב',
  fullYear = 'שנתי',
}

@Index("report_month_user_id_start_date_end_date_idx", ["userId", "startDate", "endDate"], {})
@Index("report_month_user_id_year_idx", ["userId", "year"], { unique: true })
@Index("report_month_user_id_start_date_end_date_year_idx", ["userId", "startDate", "endDate", "year"], { unique: true })
@Entity()
export class ReportMonth {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
  }

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

  @Column({ nullable: true })
  year: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
