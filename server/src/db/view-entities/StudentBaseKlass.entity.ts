import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { Klass } from 'src/db/entities/Klass.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { Student } from '../entities/Student.entity';
import { KlassType, KlassTypeEnum } from '../entities/KlassType.entity';
import { getGroupConcatExpression } from '@shared/utils/entity/column-types.util';

@ViewEntity('student_base_klass', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('student_klasses.studentReferenceId', 'id')
      .addSelect('student_klasses.user_id', 'user_id')
      .addSelect('student_klasses.year', 'year')
      .addSelect(getGroupConcatExpression('klasses.name', ', ', true), 'base_klass')
      .addSelect(getGroupConcatExpression("COALESCE(NULLIF(klasses.display_name, ''), klasses.name)", ', ', true), 'base_klass_display_name')
      .from(StudentKlass, 'student_klasses')
      .innerJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId')
      .innerJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
      .where(`klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}'`)
      .groupBy('student_klasses.user_id')
      .addGroupBy('student_klasses.year')
      .addGroupBy('student_klasses.studentReferenceId'),
})
export class StudentBaseKlass implements IHasUserId {
  @Column()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'base_klass' })
  klassName: string;

  @Column({ name: 'base_klass_display_name' })
  klassDisplayName: string;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  student: Student;
}
