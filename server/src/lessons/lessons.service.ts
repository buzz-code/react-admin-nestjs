import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { Lessons } from "../entities/Lessons";

@Injectable()
export class LessonsService extends TypeOrmCrudService<Lessons> {
  constructor(@InjectRepository(Lessons) repo) {
    super(repo);
  }
}