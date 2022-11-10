import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { KnownAbsences } from "../entities/KnownAbsences";

@Injectable()
export class KnownAbsencesService extends TypeOrmCrudService<KnownAbsences> {
  constructor(@InjectRepository(KnownAbsences) repo) {
    super(repo);
  }
}