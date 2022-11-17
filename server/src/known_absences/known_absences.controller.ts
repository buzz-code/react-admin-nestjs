import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { KnownAbsences } from "../entities/KnownAbsences";
import { KnownAbsencesService } from "./known_absences.service";

@Crud({
  model: {
    type: KnownAbsences,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("known_absences")
export class KnownAbsencesController implements CrudController<KnownAbsences> {
  constructor(public service: KnownAbsencesService) {}
}