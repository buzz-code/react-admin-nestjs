import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";
import { PhoneTemplate } from "./PhoneTemplate.entity";

@Entity("phone_campaigns")
export class PhoneCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  phoneTemplateId: number;

  @ManyToOne(() => PhoneTemplate)
  phoneTemplate: PhoneTemplate;

  @Column({ nullable: true })
  yemotCampaignId: string;

  @Column({ type: 'enum', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'pending' })
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'int', default: 0 })
  totalPhones: number;

  @Column({ type: 'int', default: 0 })
  successfulCalls: number;

  @Column({ type: 'int', default: 0 })
  failedCalls: number;

  @Column('simple-json')
  phoneNumbers: PhoneEntry[];

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}

export interface PhoneEntry {
  phone: string;
  name?: string;
  metadata?: Record<string, any>;
}
