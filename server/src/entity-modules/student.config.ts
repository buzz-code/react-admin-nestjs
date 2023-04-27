import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Student } from "src/db/entities/Student.entity";
import { In } from "typeorm";
import { AttReport } from "src/db/entities/AttReport.entity";
import { CommonReportData } from "@shared/utils/report/types";
import studentReportCard from "../reports/studentReportCard";
import { BulkToPdfReportGenerator } from "@shared/utils/report/report.generators";

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
    protected async populatePivotData(pivotName: string, list: T[]) {
        const data = list as Student[];
        const studentIds = data.map(item => item.id);
        const studentMap = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});

        switch (pivotName) {
            case 'StudentAttendance': {
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
                    });

                const headers = {};

                pivotData.forEach(item => {
                    if (item.absCount === 0) {
                        return;
                    }
                    const key = `${item.lessonReferenceId}_${item.teacherReferenceId}`;
                    if (studentMap[item.studentReferenceId][key] === undefined) {
                        studentMap[item.studentReferenceId][key] = 0;

                        if (!headers[key]) {
                            headers[key] = {
                                value: key,
                                label: `${item.lesson?.name} המו\' ${item.teacher?.name}`
                            };
                        }
                    }
                    studentMap[item.studentReferenceId][key] += item.absCount;
                    studentMap[item.studentReferenceId].total = (studentMap[item.studentReferenceId].total || 0) + item.absCount;
                });

                (data[0] as any).headers = Object.values(headers);
            }
        }
    }

    reportsDict = {
        studentReportCard: new BulkToPdfReportGenerator(studentReportCard),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = req.parsed.extra.ids
                .toString()
                .split(',')
                .map(id => ({ userId: req.auth.id, studentId: id }));
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }
}

export default getConfig();