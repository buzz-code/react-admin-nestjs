import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { databaseConfig } from "./database.config";

export const typeOrmModuleConfig: TypeOrmModuleOptions = {
    ...databaseConfig,
    entities: undefined,
    autoLoadEntities: true,
}
