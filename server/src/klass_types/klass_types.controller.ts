import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { KlassTypes } from "../entities/KlassTypes";
import { KlassTypesService } from "./klass_types.service";

@Crud({
  model: {
    type: KlassTypes,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("klass_types")
export class KlassTypesController implements CrudController<KlassTypes> {
  constructor(public service: KlassTypesService) {}
}