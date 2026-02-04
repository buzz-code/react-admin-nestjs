import { Column, DataSource, JoinColumn, OneToOne, PrimaryColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { User } from "@shared/entities/User.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";
import { Student } from "../entities/Student.entity";
import { getGroupConcatExpression } from "@shared/utils/entity/column-types.util";

@ViewEntity("student_klasses_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('students.id', 'id')
    .addSelect('students.id', 'student_reference_id')
    .addSelect('students.tz', 'student_tz')
    .addSelect('students.name', 'student_name')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')

    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', student_klasses.klassReferenceId, null)`, ',', false), 'klassReferenceId_1')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', student_klasses.klassReferenceId, null)`, ',', false), 'klassReferenceId_2')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', student_klasses.klassReferenceId, null)`, ',', false), 'klassReferenceId_3')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, student_klasses.klassReferenceId, null)`, ',', false), 'klassReferenceId_null')

    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', klasses.name, null)`, ', ', false), 'klass_name_1')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', klasses.name, null)`, ', ', false), 'klass_name_2')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', klasses.name, null)`, ', ', false), 'klass_name_3')
    .addSelect(getGroupConcatExpression(`if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, klasses.name, null)`, ', ', false), 'klass_name_null')

    .from(StudentKlass, 'student_klasses')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
    .leftJoin(Student, 'students', 'students.id = student_klasses.studentReferenceId')
    .groupBy('students.id')
    .addGroupBy('student_klasses.user_id')
    .addGroupBy('student_klasses.year')
})
export class StudentKlassReport implements IHasUserId {
  @PrimaryColumn()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @Column({ name: "student_reference_id" })
  studentReferenceId: number;

  @Column({ name: "student_name" })
  studentName: string;

  @Column('simple-array', { name: 'klassReferenceId_1' })
  klassReferenceId1: string[];

  @Column('simple-array', { name: 'klassReferenceId_2' })
  klassReferenceId2: string[];

  @Column('simple-array', { name: 'klassReferenceId_3' })
  klassReferenceId3: string[];

  @Column('simple-array', { name: 'klassReferenceId_null' })
  klassReferenceIdNull: string[];

  @Column({ name: 'klass_name_1' })
  klassName1: string;

  @Column({ name: 'klass_name_2' })
  klassName2: string;

  @Column({ name: 'klass_name_3' })
  klassName3: string;

  @Column({ name: 'klass_name_null' })
  klassNameNull: string;

  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToOne(() => Student)
  @JoinColumn([{ name: "id", referencedColumnName: "id" }])
  student: Student;
}
