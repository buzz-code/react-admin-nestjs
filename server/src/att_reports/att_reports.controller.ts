import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudAuth, CrudController } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { AttReports } from "../entities/AttReports";
import { AttReportsService } from "./att_reports.service";

@Crud({
  model: {
    type: AttReports,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("att_reports")
export class AttReportsController implements CrudController<AttReports> {
  constructor(public service: AttReportsService) {}
}