import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { StudentKlasses } from "../entities/StudentKlasses";
import { StudentKlassesService } from "./student_klasses.service";

@Crud({
  model: {
    type: StudentKlasses,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("student_klasses")
export class StudentKlassesController implements CrudController<StudentKlasses> {
  constructor(public service: StudentKlassesService) {}
}