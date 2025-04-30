import { IHasUserId } from "@shared/base-entity/interface";
import { User } from "@shared/entities/User.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { createAbsCountEffectByUserExpression, IAbsCountEffectByUser } from "@shared/view-entities/attendance-effect-view.util";

@ViewEntity('abs_count_effect_by_user', {
    expression: (dataSource: DataSource) => createAbsCountEffectByUserExpression(dataSource, User, AttGradeEffect)
})
export class AbsCountEffectByUser implements IHasUserId, IAbsCountEffectByUser {
    @PrimaryColumn()
    id: string;

    @ViewColumn()
    userId: number;

    @ViewColumn()
    number: number;

    @ViewColumn()
    effect: number;
}