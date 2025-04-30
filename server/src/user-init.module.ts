import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInitializationService } from './user-initialization.service';
import { ReportMonth } from './db/entities/ReportMonth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportMonth]),
  ],
  providers: [UserInitializationService],
  exports: [UserInitializationService],
})
export class UserInitModule { }