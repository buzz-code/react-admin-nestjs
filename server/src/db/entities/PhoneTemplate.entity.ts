import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";

@Entity("phone_templates")
export class PhoneTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ nullable: true })
  yemotTemplateId: string;

  @Column({ type: 'enum', enum: ['text'], default: 'text' })
  messageType: 'text';

  @Column({ type: 'text' })
  messageText: string;

  @Column({ length: 255, nullable: true })
  messageFilePath: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  callerId: string;

  @Column('simple-json', { nullable: true })
  settings: PhoneTemplateSettings;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface PhoneTemplateSettings {
  maxRetries?: number;
  retryDelay?: number;
  timeWindow?: { start: string; end: string };
}
