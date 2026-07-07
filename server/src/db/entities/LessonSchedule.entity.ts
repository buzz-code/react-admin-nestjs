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
import { Klass } from './Klass.entity';
import { Lesson } from './Lesson.entity';
import { Teacher } from './Teacher.entity';
import { User } from './User.entity';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber, MaxLength, IsDate } from '@shared/utils/validation/class-validator-he';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { cleanDateFields, cleanTimeFields } from '@shared/utils/entity/deafultValues.util';
import { DateType, NumberType, StringType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';

@Index('lesson_schedules_users_idx', ['userId'], {})
@Index('lesson_schedules_teacher_date_idx', ['userId', 'teacherReferenceId', 'scheduleDate'], {})
@Index('lesson_schedules_date_idx', ['userId', 'scheduleDate'], {})
@Entity('lesson_schedules')
export class LessonSchedule implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    cleanDateFields(this, ['scheduleDate']);
    cleanTimeFields(this, ['startTime']);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Teacher, Klass, Lesson, User]);

      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Teacher,
        { tz: this.teacherId },
        this.userId,
        this.teacherReferenceId,
        this.teacherId,
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Klass,
        { year: this.year, key: this.klassId },
        this.userId,
        this.klassReferenceId,
        this.klassId,
      );
      this.lessonReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Lesson,
        { year: this.year, key: this.lessonId },
        this.userId,
        this.lessonReferenceId,
        this.lessonId,
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(10, { always: true })
  @Column('varchar', { name: 'organizational_year', length: 10, nullable: true })
  organizationalYear: string | null;

  @IsOptional({ always: true })
  @StringType
  @Column('time', { name: 'start_time', nullable: true })
  startTime: string | null;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @DateType
  @IsDate({ always: true })
  @Column('date', { name: 'schedule_date' })
  scheduleDate: Date;

  @ValidateIf((lessonSchedule: LessonSchedule) => !Boolean(lessonSchedule.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'klass_id', nullable: true })
  klassId: number | null;

  @ValidateIf(
    (lessonSchedule: LessonSchedule) => !Boolean(lessonSchedule.klassId) && Boolean(lessonSchedule.klassReferenceId),
    { always: true },
  )
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index('lesson_schedules_klass_reference_id_idx')
  klassReferenceId: number;

  @ValidateIf((lessonSchedule: LessonSchedule) => !Boolean(lessonSchedule.lessonReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'lesson_id', nullable: true })
  lessonId: number | null;

  @ValidateIf(
    (lessonSchedule: LessonSchedule) =>
      !Boolean(lessonSchedule.lessonId) && Boolean(lessonSchedule.lessonReferenceId),
    { always: true },
  )
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index('lesson_schedules_lesson_reference_id_idx')
  lessonReferenceId: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'group_number', nullable: true })
  groupNumber: number | null;

  @ValidateIf((lessonSchedule: LessonSchedule) => !Boolean(lessonSchedule.teacherReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column('varchar', { name: 'teacher_id', length: 10, nullable: true })
  teacherId: string;

  @ValidateIf(
    (lessonSchedule: LessonSchedule) =>
      !Boolean(lessonSchedule.teacherId) && Boolean(lessonSchedule.teacherReferenceId),
    { always: true },
  )
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index('lesson_schedules_teacher_reference_id_idx')
  teacherReferenceId: number;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;
}
