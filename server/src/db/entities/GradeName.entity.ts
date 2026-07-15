import { BeforeInsert, BeforeUpdate, Column, DataSource, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IHasUserId } from '@shared/base-entity/interface';
import { KlassType } from './KlassType.entity';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { IsOptional } from 'class-validator';
import { IsNotEmpty, IsNumber, MaxLength } from '@shared/utils/validation/class-validator-he';
import { CrudValidationGroups } from '@dataui/crud';
import { NumberType, StringType } from '@shared/utils/entity/class-transformer';
import { CreatedAtColumn, UpdatedAtColumn } from '@shared/utils/entity/column-types.util';

@Entity('grade_names')
export class GradeName implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([KlassType]);

      this.klassTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        KlassType,
        { key: this.klassTypeId },
        this.userId,
        this.klassTypeReferenceId,
        this.klassTypeId,
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  @Index('grade_names_user_id_idx')
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'key' })
  key: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column('varchar', { name: 'name', length: 500, nullable: true })
  name: string;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column('int', { name: 'klass_type_id', nullable: true })
  klassTypeId: number | null;

  @IsOptional({ always: true })
  @Column({ nullable: true })
  @Index('grade_names_klass_type_reference_id_idx')
  klassTypeReferenceId: number;

  @CreatedAtColumn()
  createdAt: Date;

  @UpdatedAtColumn()
  updatedAt: Date;

  @ManyToOne(() => KlassType, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassTypeReferenceId' })
  klassType: KlassType;
}
