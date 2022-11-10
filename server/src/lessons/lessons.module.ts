import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Lessons } from "../entities/Lessons";
import { LessonsService } from "./lessons.service";
import { LessonsController } from "./lessons.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Lessons])],
  providers: [LessonsService],
  exports: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}