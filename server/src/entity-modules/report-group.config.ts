import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { ReportGroup } from "../db/entities/ReportGroup.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: ReportGroup,
        query: {
            join: {
                teacher: { eager: false },
                lesson: { eager: false },
                klass: { eager: false },
                sessions: { eager: false },
            }
        }
    }
}

export default getConfig();
