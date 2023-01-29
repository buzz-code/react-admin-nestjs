import { Column, DataSource, JoinColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { User } from "@shared/entities/User.entity";

@ViewEntity("student_klasses_report", {
  expression: (dataSource: DataSource) => dataSource
    .getRepository(StudentKlass)
    .createQueryBuilder('student_klasses')
    .groupBy('student_tz')
    .leftJoin(Klass, 'klasses', 'klasses.key = student_klasses.klass_id AND klasses.user_id = student_klasses.user_id')
    .select('student_tz')
    .addGroupBy('student_klasses.user_id')
    .addGroupBy('student_klasses.year')
    .addSelect('student_tz', 'id')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')
    .addSelect(`GROUP_CONCAT(if(klasses.klass_type_id in (21, 24), klasses.name, null) SEPARATOR ', ')`, 'klasses_1')
    .addSelect(`GROUP_CONCAT(if(klasses.klass_type_id in (22, 25), klasses.name, null) SEPARATOR ', ')`, 'klasses_2')
    .addSelect(`GROUP_CONCAT(if(klasses.klass_type_id in (23, 26), klasses.name, null) SEPARATOR ', ')`, 'klasses_3')
    .addSelect(`GROUP_CONCAT(if(klasses.klass_type_id not in (21, 22, 23, 24, 25, 26), klasses.name, null) SEPARATOR ', ')`, 'klasses_null')
})
export class StudentKlassReport implements IHasUserId {
  @Column()
  id: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column()
  year: number;

  @Column("varchar", { name: "student_tz", length: 10 })
  studentTz: string;

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
