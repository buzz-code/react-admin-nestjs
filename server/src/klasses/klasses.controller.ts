import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Klasses } from "../entities/Klasses";
import { KlassesService } from "./klasses.service";

@Crud({
  model: {
    type: Klasses,
  },
})
@Controller("klasses")
export class KlassesController implements CrudController<Klasses> {
  constructor(public service: KlassesService) {}
}