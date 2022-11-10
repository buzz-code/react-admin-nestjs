import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { StudentKlasses } from "../entities/StudentKlasses";
import { StudentKlassesService } from "./student_klasses.service";

@Crud({
  model: {
    type: StudentKlasses,
  },
})
@Controller("student_klasses")
export class StudentKlassesController implements CrudController<StudentKlasses> {
  constructor(public service: StudentKlassesService) {}
}