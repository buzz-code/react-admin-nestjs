import { Entity, OneToMany } from "typeorm";
import { User as BaseUser } from "@shared/entities/User.entity";
import { AttReport } from "./AttReport.entity";
import { Grade } from "./Grade.entity";
import { KlassType } from "./KlassType.entity";
import { Klass } from "./Klass.entity";
import { KnownAbsence } from "./KnownAbsence.entity";
import { Lesson } from "./Lesson.entity";
import { StudentKlass } from "./StudentKlass.entity";
import { Student } from "./Student.entity";
import { Teacher } from "./Teacher.entity";
import { Text } from "./Text.entity";

@Entity("users")
export class User extends BaseUser {
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