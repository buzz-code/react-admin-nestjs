import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AttReport } from "../../entities/AttReport.entity";
import { Grade } from "../../entities/Grade.entity";
import { KlassType } from "../../entities/KlassType.entity";
import { Klass } from "../../entities/Klass.entity";
import { KnownAbsence } from "../../entities/KnownAbsence.entity";
import { Lesson } from "../../entities/Lesson.entity";
import { StudentKlass } from "../../entities/StudentKlass.entity";
import { Student } from "../../entities/Student.entity";
import { Teacher } from "../../entities/Teacher.entity";
import { Text } from "../../entities/Text.entity";
import * as bcrypt from 'bcrypt';

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column("varchar", { name: "email", nullable: true, length: 500 })
  email: string | null;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // @ApiProperty()
  // @Column()//({select: false})
  // @Exclude()
  // password: string;
  @Column("varchar", { name: "password", nullable: true, length: 500 })
  password: string | null;

  @Column("varchar", { name: "phone_number", nullable: true, length: 11 })
  phoneNumber: string | null;

  @Column("tinyint", { name: "active", nullable: true })
  active: number | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column("varchar", { name: "from_email", nullable: true, length: 500 })
  fromEmail: string | null;

  @Column("varchar", { name: "reply_to_email", nullable: true, length: 500 })
  replyToEmail: string | null;

  @Column({nullable: true})
  effective_id: number;

  @Column("varchar", { name: "permissions", nullable: true, length: 5000 })
  permissions: any;

  @Column("varchar", { nullable: true, length: 5000 })
  additionalData: any;

  @OneToMany(() => AttReport, (attReports) => attReports.user)
  attReports: AttReport[];

  @OneToMany(() => Grade, (grades) => grades.user)
  grades: Grade[];

  @OneToMany(() => KlassType, (klassTypes) => klassTypes.user)
  klassTypes: KlassType[];

  @OneToMany(() => Klass, (klasses) => klasses.user)
  klasses: Klass[];

  @OneToMany(() => KnownAbsence, (knownAbsences) => knownAbsences.user)
  knownAbsences: KnownAbsence[];

  @OneToMany(() => Lesson, (lessons) => lessons.user)
  lessons: Lesson[];

  @OneToMany(() => StudentKlass, (studentKlasses) => studentKlasses.user)
  studentKlasses: StudentKlass[];

  @OneToMany(() => Student, (students) => students.user)
  students: Student[];

  @OneToMany(() => Teacher, (teachers) => teachers.user)
  teachers: Teacher[];

  @OneToMany(() => Text, (texts) => texts.user)
  texts: Text[];
}
