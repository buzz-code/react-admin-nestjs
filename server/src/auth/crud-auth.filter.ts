import { Users } from "src/entities/Users";

export const CrudAuthFilter = {
    property: 'user',
    filter: (user: Users) => user.permissions.admin
        ? ({})
        : ({
            userId: user.id,
        })
};

export const CrudAuthAdminFilter = {
    property: 'user',
    filter: (user: Users) => user.permissions.admin
        ? ({})
        : ({ id: -1 })
}