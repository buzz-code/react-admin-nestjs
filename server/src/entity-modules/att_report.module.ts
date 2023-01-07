import { AttReport as Entity } from "src/entities/AttReport.entity";
import { snakeCase } from "snake-case";

// sevice
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { IHeader } from "@shared/exporter/types";

@Injectable()
export class EntityService extends BaseEntityService<Entity> {
  constructor(@InjectRepository(Entity) repo) {
    super(repo);
  }

  async getDataForExport(req: CrudRequest): Promise<Entity[]> {
    req.options.query.join = {
      student: { eager: true },
      teacher: { eager: true },
      klass: { eager: true },
      lesson: { eager: true }
    };
    return super.getDataForExport(req);
  }

  getExportHeaders(): IHeader[] {
    return [
      { value: 'id', label: 'מזהה' },
      { value: 'teacher.name', label: 'שם המורה' },
      { value: 'student.name', label: 'שם התלמידה' },
      { value: 'klass.name', label: 'כיתה' },
      { value: 'lesson.name', label: 'שיעור' },
      { value: 'reportDate', label: 'תאריך דיווח' },
      { value: 'howManyLessons', label: 'מספר שיעורים' },
      { value: 'absCount', label: 'מספר חיסורים' },
      { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
      { value: 'sheetName', label: 'חודש דיווח' },
      { value: 'comments', label: 'הערות' },
    ];
  }
}


// controller
import { Controller, UseGuards, Get, UseInterceptors } from "@nestjs/common";
import { Crud, CrudAuth, CrudRequestInterceptor, CrudRequest, ParsedRequest } from "@dataui/crud";
import { CrudAuthFilter } from "@shared/auth/crud-auth.filter";
import { JwtAuthGuard } from "@shared/auth/jwt-auth.guard";
import { BaseEntityController } from "@shared/base-entity/base-entity.controller";
import { ExportFormats } from "@shared/exporter/types";

@Crud({
  model: {
    type: Entity,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller(snakeCase(Entity.name))
export class EntityController extends BaseEntityController<Entity> {
  constructor(public service: EntityService) {
    super(service);
  }

  @Get('/get-count')
  @UseInterceptors(CrudRequestInterceptor)
  getCount(@ParsedRequest() req: CrudRequest) {
    return super.getCount(req);
  }

  @Get('/export/excel')
  @UseInterceptors(CrudRequestInterceptor)
  async exportExcel(@ParsedRequest() req: CrudRequest) {
    return await this.exportFile(req, ExportFormats.Excel);
  }

  @Get('/export/pdf')
  @UseInterceptors(CrudRequestInterceptor)
  exportPdf(@ParsedRequest() req: CrudRequest) {
    return this.exportFile(req, ExportFormats.Pdf);
  }
}


// module
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  providers: [EntityService],
  exports: [EntityService],
  controllers: [EntityController],
})
export class AttReportModule { }
