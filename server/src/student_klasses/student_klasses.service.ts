import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { StudentKlasses } from "../entities/StudentKlasses";

@Injectable()
export class StudentKlassesService extends TypeOrmCrudService<StudentKlasses> {
  constructor(@InjectRepository(StudentKlasses) repo) {
    super(repo);
  }
}