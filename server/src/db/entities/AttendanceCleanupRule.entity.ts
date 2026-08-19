import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { BooleanIntColumn } from '@shared/utils/entity/column-types.util';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber, MaxLength, Max, Min } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';
import { Lesson } from './Lesson.entity';
import { Klass } from './Klass.entity';
import { User } from './User.entity';

/**
 * A recurring attendance-cleanup rule: for `lessonId` (a Lesson.key, not a
 * one-year Lesson.id), on `dayOfWeek`, delete att_reports for every klass
 * EXCEPT `klassId` (the klass/track to preserve), for each of the last
 * `weeksBack` occurrences of that weekday. Consumed weekly by the
 * attendance-cleanup-sweep job handler.
 *
 * Deliberately has no `year` column, unlike Lesson/Klass/AttReport — a rule
 * is meant to keep working across academic years. lessonReferenceId and
 * klassReferenceId below are resolved for display/at save time only; the
 * sweep re-resolves lessonId/klassId against the target date's own academic
 * year at run time, so the rule doesn't go stale when a new year's
 * Lesson/Klass rows get created with fresh ids.
 */
@Index('attendance_cleanup_rules_users_idx', ['userId'], {})
@Entity('attendance_cleanup_rules')
export class AttendanceCleanupRule implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Lesson, Klass, User]);

      this.lessonReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Lesson,
        { key: this.lessonId },
        this.userId,
        this.lessonReferenceId,
        this.lessonId,
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Klass,
        { key: this.klassId },
        this.userId,
        this.klassReferenceId,
        this.klassId,
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column('varchar', { name: 'name', length: 255, nullable: true })
  name: string | null;

  /** Lesson.key — resolved to that year's Lesson at sweep time, not fixed at creation. */
  @ValidateIf((rule: AttendanceCleanupRule) => !Boolean(rule.lessonReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'lesson_id' })
  lessonId: number;

  @ValidateIf(
    (rule: AttendanceCleanupRule) => !Boolean(rule.lessonId) && Boolean(rule.lessonReferenceId),
    { always: true },
  )
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  lessonReferenceId: number;

  /** Klass.key of the track/class to PRESERVE — every other klass gets cleaned. */
  @ValidateIf((rule: AttendanceCleanupRule) => !Boolean(rule.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'klass_id' })
  klassId: number;

  @ValidateIf(
    (rule: AttendanceCleanupRule) => !Boolean(rule.klassId) && Boolean(rule.klassReferenceId),
    { always: true },
  )
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  klassReferenceId: number;

  /** 0=Sunday .. 6=Saturday (JS Date.getDay() convention). */
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Min(0, { always: true })
  @Max(6, { always: true })
  @Column('int', { name: 'day_of_week' })
  dayOfWeek: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Min(1, { always: true })
  @Max(52, { always: true })
  @Column('int', { name: 'weeks_back', default: 2 })
  weeksBack: number;

  @BooleanIntColumn({ default: true })
  active: boolean;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
