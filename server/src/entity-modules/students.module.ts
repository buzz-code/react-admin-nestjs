import { Students as Entity } from "../entities/Students";
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
import { Controller, UseGuards } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Crud({
  model: {
    type: Entity,
  },
})
@UseGuards(JwtAuthGuard)
@CrudAuth(CrudAuthFilter)
@Controller(snakeCase(Entity.name))
export class EntityController implements CrudController<Entity> {
  constructor(public service: EntityService) {}
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
export class StudentsModule {}
