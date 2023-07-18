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
import studentReportCardReact from "src/reports/studentReportCardReact";
import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";

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
    protected async populatePivotData(pivotName: string, list: T[], extra: any) {
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
                            klassReferenceId: extra?.klassId,
                            lessonReferenceId: extra?.lessonId,
                        },
                        relations: {
                            lesson: true,
                        }
                    });

                const headers = {};

                pivotData.forEach(item => {
                    if (item.absCount === 0) {
                        return;
                    }
                    const key = `${item.lessonReferenceId}`;
                    if (studentMap[item.studentReferenceId][key] === undefined) {
                        studentMap[item.studentReferenceId][key] = 0;

                        if (!headers[key]) {
                            headers[key] = {
                                value: key,
                                label: `${item.lesson?.name}`
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
        studentReportCardReact: new BulkToPdfReportGenerator(studentReportCardReact),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const extraParams = {
                year: req.parsed.extra.year ?? getCurrentHebrewYear(),
                grades: req.parsed.extra.grades,
            }
            const params = req.parsed.extra.ids
                .toString()
                .split(',')
                .map(id => ({
                    userId: req.auth.id,
                    studentId: id,
                    ...extraParams
                }));
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }
}

export default getConfig();