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
import { findOneAndAssignKey, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { IsOptional } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber, MaxLength, Max, Min } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';
import { Lesson } from './Lesson.entity';
import { Klass } from './Klass.entity';
import { User } from './User.entity';

/**
 * A recurring attendance-cleanup rule: on `dayOfWeek`, delete att_reports for
 * every student who does NOT belong to `klassId` (the klass/track to
 * preserve, via student_klasses membership — NOT att_reports' own
 * klassReferenceId, which is the report/session's klass and the same for
 * everyone in it), for each of the last `weeksBack` occurrences of that
 * weekday. Consumed weekly by the attendance-cleanup-sweep job handler.
 *
 * Deliberately has no `year` column, unlike Lesson/Klass/AttReport/
 * StudentKlass — a rule is meant to keep working across academic years.
 * The form picks lessonReferenceId/klassReferenceId (this year's row, via a
 * friendly dropdown); fillFields below resolves those DOWN to the
 * underlying Lesson.key/Klass.key (stable across years) and persists the
 * key, not the one-year id. The sweep re-resolves key -> that target date's
 * own academic year's id at run time, so the rule doesn't go stale when a
 * new year's Lesson/Klass/StudentKlass rows get created with fresh ids.
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

      this.lessonId = await findOneAndAssignKey(dataSource, Lesson, this.userId, this.lessonReferenceId, this.lessonId);
      this.klassId = await findOneAndAssignKey(dataSource, Klass, this.userId, this.klassReferenceId, this.klassId);
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

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Column({ nullable: true })
  lessonReferenceId: number;

  /** Lesson.key, derived from lessonReferenceId in fillFields — not user-editable. */
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'lesson_id', nullable: true })
  lessonId: number;

  /** The track/class to PRESERVE (checked via student_klasses membership, not att_reports.klassReferenceId). */
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Column({ nullable: true })
  klassReferenceId: number;

  /** Klass.key, derived from klassReferenceId in fillFields — not user-editable. */
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'klass_id', nullable: true })
  klassId: number;

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
