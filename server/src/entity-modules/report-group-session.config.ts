import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { ReportGroupSession } from "../db/entities/ReportGroupSession.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: ReportGroupSession,
        query: {
            join: {
                reportGroup: { eager: false },
                attReports: { eager: false },
                grades: { eager: false },
            }
        }
    }
}

export default getConfig();
