import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Texts } from "../entities/Texts";
import { TextsService } from "./texts.service";
import { TextsController } from "./texts.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Texts])],
  providers: [TextsService],
  exports: [TextsService],
  controllers: [TextsController],
})
export class TextsModule {}