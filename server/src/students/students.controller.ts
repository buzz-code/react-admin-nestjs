import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Students } from "../entities/Students";
import { StudentsService } from "./students.service";

@Crud({
  model: {
    type: Students,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("students")
export class StudentsController implements CrudController<Students> {
  constructor(public service: StudentsService) {}
}