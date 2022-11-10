import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { StudentKlassesReport } from "../viewEntities/StudentKlassesReport";
import { StudentKlassesReportService } from "./student_klasses_report.service";

@Crud({
  model: {
    type: StudentKlassesReport,
  },
})
@Controller("student_klasses_report")
export class StudentKlassesReportController implements CrudController<StudentKlassesReport> {
  constructor(public service: StudentKlassesReportService) {}
}