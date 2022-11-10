import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { Teachers } from "../entities/Teachers";

@Injectable()
export class TeachersService extends TypeOrmCrudService<Teachers> {
  constructor(@InjectRepository(Teachers) repo) {
    super(repo);
  }
}