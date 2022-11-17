import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthAdminFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { Users } from "../entities/Users";
import { UsersService } from "./users.service";

@Crud({
  model: {
    type: Users,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthAdminFilter)
@Controller("users")
export class UsersController implements CrudController<Users> {
  constructor(public service: UsersService) {}
}