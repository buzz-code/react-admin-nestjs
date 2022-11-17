import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Texts } from "../entities/Texts";
import { TextsService } from "./texts.service";

@Crud({
  model: {
    type: Texts,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller("texts")
export class TextsController implements CrudController<Texts> {
  constructor(public service: TextsService) { }
}