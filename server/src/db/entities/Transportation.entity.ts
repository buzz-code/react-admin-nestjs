import {
  Column,
  Entity,
  Index,
  JoinColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { User } from 'src/db/entities/User.entity';
import { IsOptional } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsUniqueCombination, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';

@Index('transportations_users_idx', ['userId'], {})
@Index(['userId', 'key', 'year'], { unique: true })
@Entity('transportations')
export class Transportation implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @IsUniqueCombination(['userId', 'year'], [Transportation, User], {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column('int', { name: 'key' })
  key: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column('varchar', { name: 'departure_time', nullable: true, length: 255 })
  departureTime: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column('varchar', { name: 'description', nullable: true, length: 1000 })
  description: string | null;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}
