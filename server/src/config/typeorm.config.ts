import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

export const typeOrmConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    // synchronize: true,
    logging: "all",
};

export default typeOrmConfig;

export const typeOrmModuleConfig: TypeOrmModuleOptions = {
    ...typeOrmConfig,
    autoLoadEntities: true,
}
