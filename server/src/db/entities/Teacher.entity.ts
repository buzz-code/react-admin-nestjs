import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { User } from 'src/db/entities/User.entity';
import { IsArray, IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsUniqueCombination, MaxLength } from '@shared/utils/validation/class-validator-he';
import { StringType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';

@Index('teachers_users_idx', ['userId'], {})
@Index(['userId', 'tz', 'year'], { unique: true })
@Index('teachers_user_id_tz_idx', ['userId', 'tz'])
@Index('teachers_user_id_phone_idx', ['userId', 'phone'])
@Index('teachers_user_id_phone2_idx', ['userId', 'phone2'])
@Index('teachers_user_id_number_unique', ['userId', 'number'], { unique: true })
@Entity('teachers')
export class Teacher implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  normalizeNumber() {
    if (this.number === '') this.number = null;
  }

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = splitEmails(this.email);
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(10, { always: true })
  @IsUniqueCombination(['userId'], [Teacher, User], { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column('varchar', { name: 'tz', length: 10 })
  tz: string;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column('varchar', { name: 'name', length: 500 })
  name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(10, { always: true })
  @Column('varchar', { name: 'phone', nullable: true, length: 10 })
  phone: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(10, { always: true })
  @Column('varchar', { name: 'phone2', nullable: true, length: 10 })
  phone2: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(10, { always: true })
  @IsUniqueCombination(['userId'], [Teacher, User], { always: true })
  @Column('varchar', { name: 'number', nullable: true, length: 10 })
  number: string | null;

  @IsOptional({ always: true })
  @IsArray({ always: true })
  @IsEmail({}, { each: true, always: true })
  @Transform(({ value }) => splitEmails(value))
  @Column('simple-array', { name: 'email', nullable: true })
  email: string[] | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column('varchar', { name: 'comment', nullable: true, length: 1000 })
  comment: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column('varchar', { name: 'displayName', nullable: true, length: 500 })
  displayName: string;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.teachers, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}

function splitEmails(value: unknown): string[] | null {
  if (typeof value !== 'string') return value as string[] | null;
  return value
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}
