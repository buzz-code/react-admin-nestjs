import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Klasses } from "../entities/Klasses";
import { KlassesService } from "./klasses.service";
import { KlassesController } from "./klasses.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Klasses])],
  providers: [KlassesService],
  exports: [KlassesService],
  controllers: [KlassesController],
})
export class KlassesModule {}