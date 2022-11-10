import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { Texts } from "../entities/Texts";

@Injectable()
export class TextsService extends TypeOrmCrudService<Texts> {
  constructor(@InjectRepository(Texts) repo) {
    super(repo);
  }
}