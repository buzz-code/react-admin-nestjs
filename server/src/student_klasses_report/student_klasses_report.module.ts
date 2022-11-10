import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StudentKlassesReport } from "../viewEntities/StudentKlassesReport";
import { StudentKlassesReportService } from "./student_klasses_report.service";
import { StudentKlassesReportController } from "./student_klasses_report.controller";

@Module({
  imports: [TypeOrmModule.forFeature([StudentKlassesReport])],
  providers: [StudentKlassesReportService],
  exports: [StudentKlassesReportService],
  controllers: [StudentKlassesReportController],
})
export class StudentKlassesReportModule {}