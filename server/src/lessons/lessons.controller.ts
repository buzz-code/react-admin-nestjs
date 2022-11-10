import { Controller } from "@nestjs/common";
import { Crud, CrudController } from "@nestjsx/crud";

import { Lessons } from "../entities/Lessons";
import { LessonsService } from "./lessons.service";

@Crud({
  model: {
    type: Lessons,
  },
})
@Controller("lessons")
export class LessonsController implements CrudController<Lessons> {
  constructor(public service: LessonsService) {}
}