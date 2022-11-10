import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Teachers } from "../entities/Teachers";
import { TeachersService } from "./teachers.service";

@Crud({
  model: {
    type: Teachers,
  },
})
@Controller("teachers")
export class TeachersController implements CrudController<Teachers> {
  constructor(public service: TeachersService) {}
}