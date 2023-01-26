import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from '@shared/config/typeorm.config';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from '@shared/auth/auth.module';
import { YemotCallModule } from '@shared/yemot/yemot-call.module';
import { YemotProccessorImpl } from 'src/yemot.proccessor';
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';
import { User } from './entities/User.entity';
import { AttReport } from './entities/AttReport.entity';
import { Grade } from './entities/Grade.entity';
import { Klass } from './entities/Klass.entity';
import { KlassType } from './entities/KlassType.entity';
import { KnownAbsence } from './entities/KnownAbsence.entity';
import { Lesson } from './entities/Lesson.entity';
import { StudentKlass } from './entities/StudentKlass.entity';
import { Student } from './entities/Student.entity';
import { Teacher } from './entities/Teacher.entity';
import { Text } from './entities/Text.entity';
import { StudentKlassReport } from './view-entities/StudentKlassReport.entity';
import { CrudAuthAdminFilter } from '@shared/auth/crud-auth.filter';


@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    RequestContextModule,
    BaseEntityModule.register({ entity: User, crudAuth: CrudAuthAdminFilter }),
    BaseEntityModule.register({ entity: AttReport }),
    BaseEntityModule.register({ entity: Grade }),
    BaseEntityModule.register({ entity: Klass }),
    BaseEntityModule.register({ entity: KlassType }),
    BaseEntityModule.register({ entity: KnownAbsence }),
    BaseEntityModule.register({ entity: Lesson }),
    BaseEntityModule.register({ entity: StudentKlass }),
    BaseEntityModule.register({ entity: Student }),
    BaseEntityModule.register({ entity: Teacher }),
    BaseEntityModule.register({ entity: Text }),
    BaseEntityModule.register({ entity: StudentKlassReport }),
    AuthModule,
    YemotCallModule.register(new YemotProccessorImpl())
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
