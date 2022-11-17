import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Teachers } from "../entities/Teachers";
import { TeachersService } from "./teachers.service";

@Crud({
  model: {
    type: Teachers,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("teachers")
export class TeachersController implements CrudController<Teachers> {
  constructor(public service: TeachersService) {}
}