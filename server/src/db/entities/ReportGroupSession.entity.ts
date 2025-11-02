import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ReportGroup } from "./ReportGroup.entity";
import { AttReport } from "./AttReport.entity";
import { Grade } from "./Grade.entity";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsDate } from "@shared/utils/validation/class-validator-he";
import { StringType, NumberType, DateType } from "@shared/utils/entity/class-transformer";

@Index("report_group_sessions_report_group_id_idx", ["reportGroupId"], {})
@Index("report_group_sessions_session_date_idx", ["sessionDate"], {})
@Entity("report_group_sessions")
export class ReportGroupSession {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @NumberType
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  reportGroupId: number;

  @DateType
  @IsDate({ groups: [CrudValidationGroups.CREATE] })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ type: 'date' })
  sessionDate: Date;

  @StringType
  @Column({ type: 'time', nullable: true })
  startTime: string;

  @StringType
  @Column({ type: 'time', nullable: true })
  endTime: string;

  @StringType
  @Column({ length: 255, nullable: true })
  topic: string;                    // Can override group topic

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => ReportGroup, group => group.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportGroupId' })
  reportGroup: ReportGroup;

  @OneToMany(() => AttReport, report => report.reportGroupSession)
  attReports: AttReport[];

  @OneToMany(() => Grade, grade => grade.reportGroupSession)
  grades: Grade[];
}
