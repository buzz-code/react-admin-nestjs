import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { User } from "src/db/entities/User.entity";


@Index("texts_users_idx", ["userId"], {})
@Entity("texts")
export class Text implements IHasUserId {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @Column("varchar", { name: "description", length: 100 })
  description: string;

  @Column("varchar", { name: "value", length: 10000 })
  value: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.texts, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
