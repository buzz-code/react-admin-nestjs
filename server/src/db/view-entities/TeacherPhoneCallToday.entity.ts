import { Column, DataSource, ViewEntity } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { Teacher } from '../entities/Teacher.entity';

@ViewEntity('teacher_phone_call_today', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('yemot_call.id', 'id')
      .addSelect('yemot_call.userId', 'userId')
      .addSelect('teacher.id', 'teacherReferenceId')
      .addSelect('teacher.name', 'teacherName')
      .addSelect('yemot_call.phone', 'phone')
      .addSelect('yemot_call.isOpen', 'isOpen')
      .addSelect('yemot_call.hasError', 'hasError')
      .addSelect('yemot_call.createdAt', 'callTime')
      .from(YemotCall, 'yemot_call')
      .innerJoin(
        Teacher,
        'teacher',
        '(teacher.phone = yemot_call.phone OR teacher.phone2 = yemot_call.phone) AND teacher.userId = yemot_call.userId',
      ),
})
export class TeacherPhoneCallToday implements IHasUserId {
  @Column()
  id: number;

  @Column()
  userId: number;

  @Column()
  teacherReferenceId: number;

  @Column()
  teacherName: string;

  @Column()
  phone: string;

  @Column()
  isOpen: boolean;

  @Column()
  hasError: boolean;

  @Column()
  callTime: Date;
}
