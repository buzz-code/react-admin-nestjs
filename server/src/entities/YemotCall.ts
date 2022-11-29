import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./Users";

@Entity()
export class YemotCall {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => Users)
    user: Users;

    @Column()
    apiCallId: string;

    @Column()
    phone: string;

    @Column('simple-json')
    history: YemotStep[];

    @Column()
    currentStep: string;

    @Column('simple-json')
    data: any;

    @Column()
    isOpen: Boolean;

    @Column()
    hasError: Boolean;

    @Column()
    errorMessage: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

interface YemotStep {
    time: Date;
    params: any;
    response: any;
}

export interface YemotParams {
    ApiCallId: string;
    ApiYFCallId:string;
    ApiDID:string;
    ApiRealDID:string;
    ApiPhone:string;
    ApiExtension:string;
    ApiTime:string;
    [key: string]: string;
}