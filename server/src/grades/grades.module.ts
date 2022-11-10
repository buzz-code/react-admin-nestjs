import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Grades } from "../entities/Grades";
import { GradesService } from "./grades.service";
import { GradesController } from "./grades.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Grades])],
  providers: [GradesService],
  exports: [GradesService],
  controllers: [GradesController],
})
export class GradesModule {}