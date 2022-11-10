import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";

import { StudentKlassesReport } from "../viewEntities/StudentKlassesReport";

@Injectable()
export class StudentKlassesReportService extends TypeOrmCrudService<StudentKlassesReport> {
  constructor(@InjectRepository(StudentKlassesReport) repo) {
    super(repo);
  }
}