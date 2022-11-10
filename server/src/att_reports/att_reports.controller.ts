import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { AttReports } from "../entities/AttReports";
import { AttReportsService } from "./att_reports.service";

@Crud({
  model: {
    type: AttReports,
  },
})
@Controller("att_reports")
export class AttReportsController implements CrudController<AttReports> {
  constructor(public service: AttReportsService) {}
}