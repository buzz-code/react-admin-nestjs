import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { StudentKlassReport } from "src/db/view-entities/StudentKlassReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentKlassReport,
    }
}

export default getConfig();