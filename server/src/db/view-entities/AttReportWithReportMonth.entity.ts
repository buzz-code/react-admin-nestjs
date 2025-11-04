import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { AttReport } from "../entities/AttReport.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";

@ViewEntity("att_report_with_report_month", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('ar.*')
    .addSelect('report_months.id', 'reportMonthReferenceId')
    .from(AttReport, 'ar')
    .leftJoin(ReportMonth, 'report_months', 'ar.user_id = report_months.userId AND ar.report_date <= report_months.endDate AND ar.report_date >= report_months.startDate')
})
export class AttReportWithReportMonth extends AttReport implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  reportMonthReferenceId: number;

  @ManyToOne(() => ReportMonth, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'reportMonthReferenceId' })
  reportMonth: ReportMonth;
}
