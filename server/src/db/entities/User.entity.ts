import { Entity } from 'typeorm';
import { User as BaseUser } from '@shared/entities/User.entity';
import { Grade } from 'src/db/entities/Grade.entity';
import { KlassType } from 'src/db/entities/KlassType.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { Student } from 'src/db/entities/Student.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';

@Entity('users')
export class User extends BaseUser {
  // Typed only, not mapped: these entities reference the user through a plain
  // `userId` column, with no TypeORM relation. Adding @OneToMany here would
  // also require a matching @ManyToOne on each entity.
  grades: Grade[];

  klassTypes: KlassType[];

  knownAbsences: KnownAbsence[];

  students: Student[];

  teachers: Teacher[];
}
