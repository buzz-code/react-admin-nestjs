import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity()
export class YemotCall {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    userId: Number;

    @ManyToOne(() => Users)
    user: Users;

    @Column()
    phone: String;

    @Column('simple-json')
    params: YemotParams;

    @Column()
    currentStep: String;

    @Column()
    isOpen: Boolean;

    @Column()
    hasError: Boolean;

    @Column()
    errorMessage: String;
}

interface YemotParams {
    teacherId: string;

}
