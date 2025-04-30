import { IHasUserId } from "@shared/base-entity/interface";
import { User } from "@shared/entities/User.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { createGradeEffectByUserExpression, IGradeEffectByUser } from "@shared/view-entities/attendance-effect-view.util";

@ViewEntity('grade_effect_by_user', {
    expression: (dataSource: DataSource) => createGradeEffectByUserExpression(dataSource, User, AttGradeEffect)
})
export class GradeEffectByUser implements IHasUserId, IGradeEffectByUser {
    @PrimaryColumn()
    id: string;

    @ViewColumn()
    userId: number;

    @ViewColumn()
    number: number;

    @ViewColumn()
    effect: number;
}