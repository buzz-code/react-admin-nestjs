import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Students } from "../entities/Students";
import { StudentsService } from "./students.service";

@Crud({
  model: {
    type: Students,
  },
})
@Controller("students")
export class StudentsController implements CrudController<Students> {
  constructor(public service: StudentsService) {}
}