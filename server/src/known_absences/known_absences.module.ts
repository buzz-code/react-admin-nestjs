import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { KnownAbsences } from "../entities/KnownAbsences";
import { KnownAbsencesService } from "./known_absences.service";
import { KnownAbsencesController } from "./known_absences.controller";

@Module({
  imports: [TypeOrmModule.forFeature([KnownAbsences])],
  providers: [KnownAbsencesService],
  exports: [KnownAbsencesService],
  controllers: [KnownAbsencesController],
})
export class KnownAbsencesModule {}