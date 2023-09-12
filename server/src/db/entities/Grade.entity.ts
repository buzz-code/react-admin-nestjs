import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { User } from "src/db/entities/User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "./Student.entity";
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { Teacher } from "./Teacher.entity";
import { KlassType } from "./KlassType.entity";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { fillDefaultReportDateValue } from "@shared/utils/entity/deafultValues.util";

@Index("grades_users_idx", ["userId"], {})
@Entity("grades")
export class Grade implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    fillDefaultReportDateValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Teacher, Klass, Lesson, User, KlassType]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
      );
      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource, Teacher, { tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
      );
      this.lessonReferenceId = await findOneAndAssignReferenceId(
        dataSource, Lesson, { year: this.year, key: this.lessonId }, this.userId, this.lessonReferenceId, this.lessonId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @Column({ nullable: true })
  studentReferenceId: number;

  @Column("varchar", { name: "teacher_id", length: 10, nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  teacherReferenceId: number;

  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @Column({ nullable: true })
  klassReferenceId: number;

  @Column("int", { name: "lesson_id", nullable: true })
  lessonId: number;

  @Column({ nullable: true })
  lessonReferenceId: number;

  @Column("date", { name: "report_date" })
  reportDate: Date;

  @Column("int", { name: "how_many_lessons", nullable: true })
  howManyLessons: number | null;

  @Column("int", { name: "grade", default: () => "'0'" })
  grade: number;

  @Column("varchar", { name: "comments", nullable: true, length: 500 })
  comments: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.grades, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
