import { Users } from "src/entities/Users.entity";

export const CrudAuthFilter = {
    property: 'user',
    filter: (user: Users) => user.permissions.admin
        ? ({})
        : ({
            userId: user.effective_id,
        })
};

export const CrudAuthAdminFilter = {
    property: 'user',
    filter: (user: Users) => user.permissions.admin
        ? ({})
        : ({ id: -1 })
}