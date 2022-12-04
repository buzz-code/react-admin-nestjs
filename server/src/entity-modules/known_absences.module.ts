import { KnownAbsences as Entity } from "../entities/KnownAbsences";
import { snakeCase } from "snake-case";

// sevice
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityService } from "../common/base-entity.service";

@Injectable()
export class EntityService extends BaseEntityService<Entity> {
  constructor(@InjectRepository(Entity) repo) {
    super(repo);
  }
}


// controller
import { Controller, UseGuards, Get, UseInterceptors } from "@nestjs/common";
import { Crud, CrudAuth, CrudRequestInterceptor, CrudRequest, ParsedRequest } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { BaseEntityController } from "src/common/base-entity.controller";

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
export class KnownAbsencesModule {}
