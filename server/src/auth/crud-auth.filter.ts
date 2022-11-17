import { Users } from "src/entities/Users";

export const CrudAuthFilter = {
    property: 'user',
    filter: (user: Users) => ({
        // userId: user.id,
    })
};

export const CrudAuthAdminFilter = {
    property: 'user',
    filter: (user: Users) => ({
        //todo
    })
}