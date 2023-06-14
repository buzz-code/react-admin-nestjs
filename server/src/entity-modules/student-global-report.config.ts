import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { StudentGlobalReport } from "src/db/view-entities/StudentGlobalReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentGlobalReport,
        query: {
            join: {
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
            }
        },
    }
}

export default getConfig();