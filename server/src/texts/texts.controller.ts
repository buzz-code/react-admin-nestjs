import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Texts } from "../entities/Texts";
import { TextsService } from "./texts.service";

@Crud({
  model: {
    type: Texts,
  },
})
@Controller("texts")
export class TextsController implements CrudController<Texts> {
  constructor(public service: TextsService) {}
}