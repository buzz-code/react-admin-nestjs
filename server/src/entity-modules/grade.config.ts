import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { Grade } from "src/entities/Grade.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Grade,
    }
}

export default getConfig();