import { Column, DataSource, JoinColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { User } from "@shared/entities/User.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";

@ViewEntity("student_klasses_report", {
  expression: (dataSource: DataSource) => dataSource
    .getRepository(StudentKlass)
    .createQueryBuilder('student_klasses')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId OR (klasses.key = student_klasses.klass_id AND klasses.user_id = student_klasses.user_id)')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId OR (klass_types.id = klasses.klass_type_id AND klass_types.user_id = klasses.user_id)')
    .groupBy('student_klasses.studentReferenceId')
    .addGroupBy('student_klasses.student_tz')
    .addGroupBy('student_klasses.user_id')
    .addGroupBy('student_klasses.year')
    .select('COALESCE(studentReferenceId, student_tz)', 'id')
    .addSelect('student_tz')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', klasses.name, null) SEPARATOR ', ')`, 'klasses_1')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', klasses.name, null) SEPARATOR ', ')`, 'klasses_2')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', klasses.name, null) SEPARATOR ', ')`, 'klasses_3')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, klasses.name, null) SEPARATOR ', ')`, 'klasses_null')
})
export class StudentKlassReport implements IHasUserId {
  @Column()
  id: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
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
