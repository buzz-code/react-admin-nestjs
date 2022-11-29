import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AttReports } from "./AttReports";
import { Grades } from "./Grades";
import { KlassTypes } from "./KlassTypes";
import { Klasses } from "./Klasses";
import { KnownAbsences } from "./KnownAbsences";
import { Lessons } from "./Lessons";
import { StudentKlasses } from "./StudentKlasses";
import { Students } from "./Students";
import { Teachers } from "./Teachers";
import { Texts } from "./Texts";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @Column("varchar", { name: "email", nullable: true, length: 500 })
  email: string | null;

  // @BeforeInsert()
  // async hashPassword() {
  //     this.password = await bcrypt.hash(this.password, 10);
  // }
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

  @Column({ name: "id" })
  effective_id: number;

  @Column("varchar", { name: "permissions", nullable: true, length: 5000 })
  permissions: any;

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
