import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Grades } from "../entities/Grades";
import { GradesService } from "./grades.service";

@Crud({
  model: {
    type: Grades,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("grades")
export class GradesController implements CrudController<Grades> {
  constructor(public service: GradesService) {}
}