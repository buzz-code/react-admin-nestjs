import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/entities/Users";
import { AttReports } from "./entities/AttReports";
import { Grades } from "./entities/Grades";
import { Klasses } from "./entities/Klasses";
import { KlassTypes } from "./entities/KlassTypes";
import { KnownAbsences } from "./entities/KnownAbsences";
import { Lessons } from "./entities/Lessons";
import { StudentKlasses } from "./entities/StudentKlasses";
import { Students } from "./entities/Students";
import { Teachers } from "./entities/Teachers";
import { Texts } from "./entities/Texts";
import { StudentKlassesReport } from "./viewEntities/StudentKlassesReport";

export default TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [AttReports, Grades, Klasses, KlassTypes, KnownAbsences, Lessons, StudentKlasses, Students, Teachers, Texts, Users, StudentKlassesReport],
    // synchronize: true,
    logging: "all",
    // logger:"debug"
});