import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { StudentPercentReport } from "src/db/view-entities/StudentPercentReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentPercentReport,
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