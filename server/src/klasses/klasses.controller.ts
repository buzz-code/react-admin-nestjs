import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Klasses } from "../entities/Klasses";
import { KlassesService } from "./klasses.service";

@Crud({
  model: {
    type: Klasses,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("klasses")
export class KlassesController implements CrudController<Klasses> {
  constructor(public service: KlassesService) {}
}