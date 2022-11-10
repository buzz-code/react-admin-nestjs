import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Students } from "../entities/Students";
import { StudentsService } from "./students.service";
import { StudentsController } from "./students.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Students])],
  providers: [StudentsService],
  exports: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}