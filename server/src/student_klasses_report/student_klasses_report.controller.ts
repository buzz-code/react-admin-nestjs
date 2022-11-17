import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { StudentKlassesReport } from "../viewEntities/StudentKlassesReport";
import { StudentKlassesReportService } from "./student_klasses_report.service";

@Crud({
  model: {
    type: StudentKlassesReport,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("student_klasses_report")
export class StudentKlassesReportController implements CrudController<StudentKlassesReport> {
  constructor(public service: StudentKlassesReportService) {}
}