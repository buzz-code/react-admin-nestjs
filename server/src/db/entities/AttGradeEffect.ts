import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { IsOptional, ValidateIf } from 'class-validator';
import { IsNotEmpty, IsNumber } from '@shared/utils/validation/class-validator-he';
import { CrudValidationGroups } from '@dataui/crud';
import { NumberType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';

@Entity('att_grade_effect')
export class AttGradeEffect implements IHasUserId {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  @Index('att_grade_effect_user_id_idx')
  userId: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  percents: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  count: number;

  @ValidateIf((item: AttGradeEffect) => !Boolean(item.effectPercent), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  effect: number;

  @ValidateIf((item: AttGradeEffect) => !Boolean(item.effect), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  effectPercent: number;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;
}
