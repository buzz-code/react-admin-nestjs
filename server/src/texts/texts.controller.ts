import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Users } from "src/entities/Users";

import { Texts } from "../entities/Texts";
import { TextsService } from "./texts.service";

@Crud({
  model: {
    type: Texts,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth({
  property: "user",
  filter: (user: Users) => ({
    userId: user.id,
  }),
})
@Controller("texts")
export class TextsController implements CrudController<Texts> {
  constructor(public service: TextsService) { }
}