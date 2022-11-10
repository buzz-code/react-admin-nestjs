import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AttReports } from "../entities/AttReports";
import { AttReportsService } from "./att_reports.service";
import { AttReportsController } from "./att_reports.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AttReports])],
  providers: [AttReportsService],
  exports: [AttReportsService],
  controllers: [AttReportsController],
})
export class AttReportsModule {}