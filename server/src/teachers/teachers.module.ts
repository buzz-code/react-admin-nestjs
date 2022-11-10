import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Teachers } from "../entities/Teachers";
import { TeachersService } from "./teachers.service";
import { TeachersController } from "./teachers.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Teachers])],
  providers: [TeachersService],
  exports: [TeachersService],
  controllers: [TeachersController],
})
export class TeachersModule {}