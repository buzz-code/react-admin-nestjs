import { CrudAuthAdminFilter } from "@shared/auth/crud-auth.filter";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { User } from "src/entities/User.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: User,
        crudAuth: CrudAuthAdminFilter
    }
}

export default getConfig();