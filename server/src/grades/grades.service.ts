import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { Grades } from "../entities/Grades";

@Injectable()
export class GradesService extends TypeOrmCrudService<Grades> {
  constructor(@InjectRepository(Grades) repo) {
    super(repo);
  }
}