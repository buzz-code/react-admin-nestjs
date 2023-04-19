import { CrudRequest, CrudRequestOptions, GetManyDefaultResponse, Override } from "@dataui/crud";
import { InjectDataSource } from "@nestjs/typeorm";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Student } from "src/db/entities/Student.entity";
import { DataSource, In, SelectQueryBuilder } from "typeorm";
import { ParsedRequestParams } from "@dataui/crud-request";
import { AttReport } from "src/db/entities/AttReport.entity";
import { CommonFileResponse } from "@shared/utils/report/types";
import { getCommonFileResponse, getFileBuffer } from "@shared/utils/report/report.util";
import studentReportCard from "../reports/studentReportCard";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Student,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'tz', label: 'תז' },
                    { value: 'name', label: 'שם' },
                ];
            }
        },
        service: StudentService,
    }
}

class StudentService<T extends Entity | Student> extends BaseEntityService<T> {
    @InjectDataSource()
    private dataSource: DataSource;

    @Override()
    protected async doGetMany(builder: SelectQueryBuilder<T>, query: ParsedRequestParams, options: CrudRequestOptions): Promise<T[] | GetManyDefaultResponse<T>> {
        const res = await super.doGetMany(builder, query, options);
        const list = Array.isArray(res) ? res : res.data;
        if (list.length > 0) {
            await this.populatePivotData(list as Student[]);
        }
        return res;
    }

    private async populatePivotData(data: Student[]) {
        const studentIds = data.map(item => item.id);
        const studentMap = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});

        const pivotData = await this.dataSource
            .getRepository(AttReport)
            .find({
                where: {
                    userId: data[0].userId,
                    studentReferenceId: In(studentIds),
                },
                relations: {
                    lesson: true,
                    teacher: true,
                }
            })

        pivotData.forEach(item => {
            const key = `${item.lessonReferenceId}_${item.teacherReferenceId}`;
            if (studentMap[item.studentReferenceId][key] === undefined) {
                studentMap[item.studentReferenceId][key] = 0;
                studentMap[item.studentReferenceId][`${key}_title`] = `${item.lesson?.name} המו\' ${item.teacher?.name}`;
            }
            studentMap[item.studentReferenceId][key] += item.absCount;
            studentMap[item.studentReferenceId].total = (studentMap[item.studentReferenceId].total || 0) + item.absCount;
        })
    }

    reportsDict = {
        studentReportCard,
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonFileResponse> {
        const generator = this.reportsDict[req.parsed.extra.report];
        const params = { userId: 1, studentId: 23 };
        const name = req.parsed.extra.report;
        if (generator) {
            const data = await generator.getReportData(this.dataSource, params);
            const buffer = await getFileBuffer(generator, data);
            return getCommonFileResponse(buffer, generator.fileFormat, name);
        }
        return super.getReportData(req);
    }
}

export default getConfig();