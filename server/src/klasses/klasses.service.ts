import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { Klasses } from "../entities/Klasses";

@Injectable()
export class KlassesService extends TypeOrmCrudService<Klasses> {
  constructor(@InjectRepository(Klasses) repo) {
    super(repo);
  }
}