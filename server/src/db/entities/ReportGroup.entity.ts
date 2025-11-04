import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "./Teacher.entity";
import { Lesson } from "./Lesson.entity";
import { Klass } from "./Klass.entity";
import { ReportGroupSession } from "./ReportGroupSession.entity";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, MaxLength } from "@shared/utils/validation/class-validator-he";
import { StringType, NumberType } from "@shared/utils/entity/class-transformer";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";

@Index("report_groups_user_id_idx", ["userId"], {})
@Index("report_groups_user_id_year_idx", ["userId", "year"], {})
@Entity("report_groups")
export class ReportGroup implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
  }

 @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @StringType
  @MaxLength(255, { groups: [CrudValidationGroups.CREATE] })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ length: 255 })
  name: string;

  @StringType
  @MaxLength(255, { groups: [CrudValidationGroups.CREATE, CrudValidationGroups.UPDATE] })
  @Column({ length: 255, nullable: true })
  topic: string;

  @StringType
  @Column({ type: 'longtext', nullable: true })
  signatureData: string;            // ONE signature for entire group

  @NumberType
  @Column({ nullable: true })
  @Index("report_groups_teacher_reference_id_idx")
  teacherReferenceId: number;

  @NumberType
  @Column({ nullable: true })
  @Index("report_groups_lesson_reference_id_idx")
  lessonReferenceId: number;

  @NumberType
  @Column({ nullable: true })
  @Index("report_groups_klass_reference_id_idx")
  klassReferenceId: number;

  @NumberType
  @Column({ nullable: true })
  year: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Lesson, { nullable: true })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { nullable: true })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;

  @OneToMany(() => ReportGroupSession, session => session.reportGroup)
  sessions: ReportGroupSession[];
}
