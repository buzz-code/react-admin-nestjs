import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StudentKlasses } from "../entities/StudentKlasses";
import { StudentKlassesService } from "./student_klasses.service";
import { StudentKlassesController } from "./student_klasses.controller";

@Module({
  imports: [TypeOrmModule.forFeature([StudentKlasses])],
  providers: [StudentKlassesService],
  exports: [StudentKlassesService],
  controllers: [StudentKlassesController],
})
export class StudentKlassesModule {}