import { Column, DataSource, JoinColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { User } from "@shared/entities/User.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";
import { Student } from "../entities/Student.entity";

@ViewEntity("student_klasses_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('students.id', 'id')
    .addSelect('student_tz')
    .addSelect('students.name', 'studentName')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', klasses.name, null) SEPARATOR ', ')`, 'klasses_1')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', klasses.name, null) SEPARATOR ', ')`, 'klasses_2')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', klasses.name, null) SEPARATOR ', ')`, 'klasses_3')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, klasses.name, null) SEPARATOR ', ')`, 'klasses_null')
    .from(StudentKlass, 'student_klasses')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId OR (klasses.key = student_klasses.klass_id AND klasses.user_id = student_klasses.user_id)')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId OR (klass_types.id = klasses.klass_type_id AND klass_types.user_id = klasses.user_id)')
    .leftJoin(Student, 'students', 'students.id = student_klasses.studentReferenceId OR (students.tz = student_klasses.student_tz AND students.user_id = student_klasses.user_id)')
    .groupBy('students.id')
    .addGroupBy('student_klasses.student_tz')
    .addGroupBy('student_klasses.user_id')
    .addGroupBy('student_klasses.year')
})
export class StudentKlassReport implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @Column({ name: "id" })
  studentReferenceId: number;

  @Column()
  studentName: string;

  @Column({ name: "klasses_1" })
  klasses1: string;

  @Column({ name: "klasses_2" })
  klasses2: string;

  @Column({ name: "klasses_3" })
  klasses3: string;

  @Column({ name: "klasses_null" })
  klassesNull: string;

  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
