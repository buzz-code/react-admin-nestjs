import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AttReports } from "./AttReports.entity";
import { Grades } from "./Grades.entity";
import { KlassTypes } from "./KlassTypes.entity";
import { Klasses } from "./Klasses.entity";
import { KnownAbsences } from "./KnownAbsences.entity";
import { Lessons } from "./Lessons.entity";
import { StudentKlasses } from "./StudentKlasses.entity";
import { Students } from "./Students.entity";
import { Teachers } from "./Teachers.entity";
import { Texts } from "./Texts.entity";
import * as bcrypt from 'bcrypt';

@Entity("users")
export class Users {
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

  @OneToMany(() => AttReports, (attReports) => attReports.user)
  attReports: AttReports[];

  @OneToMany(() => Grades, (grades) => grades.user)
  grades: Grades[];

  @OneToMany(() => KlassTypes, (klassTypes) => klassTypes.user)
  klassTypes: KlassTypes[];

  @OneToMany(() => Klasses, (klasses) => klasses.user)
  klasses: Klasses[];

  @OneToMany(() => KnownAbsences, (knownAbsences) => knownAbsences.user)
  knownAbsences: KnownAbsences[];

  @OneToMany(() => Lessons, (lessons) => lessons.user)
  lessons: Lessons[];

  @OneToMany(() => StudentKlasses, (studentKlasses) => studentKlasses.user)
  studentKlasses: StudentKlasses[];

  @OneToMany(() => Students, (students) => students.user)
  students: Students[];

  @OneToMany(() => Teachers, (teachers) => teachers.user)
  teachers: Teachers[];

  @OneToMany(() => Texts, (texts) => texts.user)
  texts: Texts[];
}
