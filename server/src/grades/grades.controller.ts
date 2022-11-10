import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Grades } from "../entities/Grades";
import { GradesService } from "./grades.service";

@Crud({
  model: {
    type: Grades,
  },
})
@Controller("grades")
export class GradesController implements CrudController<Grades> {
  constructor(public service: GradesService) {}
}