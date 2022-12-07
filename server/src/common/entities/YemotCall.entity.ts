import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./Users.entity";

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

    @Column('simple-json', { nullable: true })
    data: any;

    @Column()
    isOpen: Boolean;

    @Column({ default: false })
    hasError: Boolean;

    @Column({ nullable: true })
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
    ApiYFCallId: string;
    ApiDID: string;
    ApiRealDID: string;
    ApiPhone: string;
    ApiExtension: string;
    ApiTime: string;
    hangup: string;
    [key: string]: string;
}