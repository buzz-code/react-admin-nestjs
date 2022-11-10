import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { KlassTypes } from "../entities/KlassTypes";

@Injectable()
export class KlassTypesService extends TypeOrmCrudService<KlassTypes> {
  constructor(@InjectRepository(KlassTypes) repo) {
    super(repo);
  }
}