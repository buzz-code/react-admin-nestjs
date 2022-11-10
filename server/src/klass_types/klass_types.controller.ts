import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { KlassTypes } from "../entities/KlassTypes";
import { KlassTypesService } from "./klass_types.service";

@Crud({
  model: {
    type: KlassTypes,
  },
})
@Controller("klass_types")
export class KlassTypesController implements CrudController<KlassTypes> {
  constructor(public service: KlassTypesService) {}
}