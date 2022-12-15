import { Entity, OneToMany } from "typeorm";
import { User as BaseUser } from "@shared/entities/User.entity";
import { AttReport } from "src/entities/AttReport.entity";
import { Grade } from "src/entities/Grade.entity";
import { KlassType } from "src/entities/KlassType.entity";
import { Klass } from "src/entities/Klass.entity";
import { KnownAbsence } from "src/entities/KnownAbsence.entity";
import { Lesson } from "src/entities/Lesson.entity";
import { StudentKlass } from "src/entities/StudentKlass.entity";
import { Student } from "src/entities/Student.entity";
import { Teacher } from "src/entities/Teacher.entity";
import { Text } from "src/entities/Text.entity";

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