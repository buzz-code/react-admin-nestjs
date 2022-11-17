import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Lessons } from "../entities/Lessons";
import { LessonsService } from "./lessons.service";

@Crud({
  model: {
    type: Lessons,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("lessons")
export class LessonsController implements CrudController<Lessons> {
  constructor(public service: LessonsService) {}
}