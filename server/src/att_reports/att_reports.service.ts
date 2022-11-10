import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { AttReports } from "../entities/AttReports";

@Injectable()
export class AttReportsService extends TypeOrmCrudService<AttReports> {
  constructor(@InjectRepository(AttReports) repo) {
    super(repo);
  }
}