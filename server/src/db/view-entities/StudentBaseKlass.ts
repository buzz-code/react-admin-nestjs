import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { Student } from "../entities/Student.entity";

@ViewEntity("student_base_klass", {
  expression: (dataSource: DataSource) => dataSource
    .getRepository(StudentKlass)
    .createQueryBuilder('student_klasses')
    .groupBy('student_tz')
    .addGroupBy('user_id')
    .leftJoin(Klass, 'klasses', 'klasses.key = student_klasses.klass_id AND klasses.user_id = student_klasses.user_id')
    .select('student_tz')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect(`GROUP_CONCAT(if(klasses.klass_type_id in (21, 24), klasses.name, null) SEPARATOR ', ')`, 'base_klass')
})
export class StudentBaseKlass implements IHasUserId {
  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

  @Column({ name: "base_klass" })
  klassName: string;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "user_id", referencedColumnName: "userId" },
    { name: "student_tz", referencedColumnName: "tz" }
  ])
  student: Student;
}
