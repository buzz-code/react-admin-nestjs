import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { AttReport } from "../entities/AttReport.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";

@ViewEntity("att_report_with_report_month", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('att_reports.*')
    .addSelect('report_months.id', 'reportMonthReferenceId')
    .from(AttReport, 'att_reports')
    .leftJoin(ReportMonth, 'report_months', 'att_reports.user_id = report_months.userId AND att_reports.report_date <= report_months.endDate AND att_reports.report_date >= report_months.startDate')
})
export class AttReportWithReportMonth implements IHasUserId {
  @Column()
  id: number;

  @Column()
  userId: number;

  @Column()
  reportMonthReferenceId: number;
}
