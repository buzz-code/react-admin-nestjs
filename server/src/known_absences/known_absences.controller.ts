import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { KnownAbsences } from "../entities/KnownAbsences";
import { KnownAbsencesService } from "./known_absences.service";

@Crud({
  model: {
    type: KnownAbsences,
  },
})
@Controller("known_absences")
export class KnownAbsencesController implements CrudController<KnownAbsences> {
  constructor(public service: KnownAbsencesService) {}
}