import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_INITIALIZATION_SERVICE } from '@shared/auth/user-initialization.interface';
import { UserInitializationService } from './user-initialization.service';
import { ReportMonth } from './db/entities/ReportMonth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportMonth])],
  providers: [
    UserInitializationService,
    { provide: USER_INITIALIZATION_SERVICE, useExisting: UserInitializationService },
  ],
  exports: [UserInitializationService, USER_INITIALIZATION_SERVICE],
})
export class UserInitModule {}
