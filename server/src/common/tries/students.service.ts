import { Injectable } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { CrudRequestOptions, GetManyDefaultResponse, Override } from "@nestjsx/crud";
import { ParsedRequestParams } from "@nestjsx/crud-request";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { AttReport } from "src/entities/AttReport.entity";
import { DataSource, SelectQueryBuilder } from "typeorm";

import { Student } from "../../entities/Student.entity";

@Injectable()
export class StudentsService extends TypeOrmCrudService<Student> {
  constructor(@InjectRepository(Student) repo) {
    super(repo);
  }

  @InjectDataSource()
  private dataSource: DataSource;

  @Override()
  protected async doGetMany(builder: SelectQueryBuilder<Student>, query: ParsedRequestParams, options: CrudRequestOptions): Promise<Student[] | GetManyDefaultResponse<Student>> {
    if (this.decidePagination(query, options)) {
      const [data, total] = await builder.getManyAndCount();
      const limit = builder.expressionMap.take;
      const offset = builder.expressionMap.skip;
      // await this.populatePivotData(data);
      return this.createPageInfo(data, total, limit || total, offset || 0);
    }
    return builder.getMany();
  }

  private async populatePivotData(data: Student[]) {
    const studentTzs = data.map(item => item.tz);
    const studentMap = data.reduce((a, b) => ({ ...a, [b.tz]: b }), {});

    const pivotData = await this.dataSource
      .getRepository(AttReport)
      .createQueryBuilder('att_reports')
      .where('user_id = :userId', { userId: data[0].userId })
      .andWhere('student_tz in (:...studentTzs)', { studentTzs })
      .getMany();

    pivotData.forEach(item => {
      const key = item.lessonId + '_' + item.teacherId;
      console.log(key)
      if (studentMap[item.studentTz][key] === undefined) {
        studentMap[item.studentTz][key] = 0;
        // studentMap[item.studentTz][key + '_title'] = item.lesson_name + ' המו\' ' + item.teacher_name;
      }
      studentMap[item.studentTz][key] += item.absCount;
      studentMap[item.studentTz].total = (studentMap[item.studentTz].total || 0) + item.absCount;
    })
  }
}