import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { KlassTypes } from "../entities/KlassTypes";
import { KlassTypesService } from "./klass_types.service";
import { KlassTypesController } from "./klass_types.controller";

@Module({
  imports: [TypeOrmModule.forFeature([KlassTypes])],
  providers: [KlassTypesService],
  exports: [KlassTypesService],
  controllers: [KlassTypesController],
})
export class KlassTypesModule {}