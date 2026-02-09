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
import { IsOptional, Min } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsUniqueCombination, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';


@Index('events_users_idx', ['userId'], {})
@Index(['userId', 'name', 'year'], { unique: true })
@Entity('events') 
export class Event implements IHasUserId {
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

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @StringType
  @MaxLength(100, { always: true })
  @Column('varchar', { name: 'name', length: 100 })
  name: string;

  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Min(0, { always: true }) 
  @NumberType
  @Column('decimal', { name: 'quota', precision: 5, scale: 1 })
  quota: number;

  @IsOptional({ always: true })
  @Column({
    type: 'simple-array', 
    name: 'required_labels', 
    nullable: true,
  })
  requiredLabels: string[] | null;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}