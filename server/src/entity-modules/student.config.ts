import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Student } from "src/db/entities/Student.entity";
import { In } from "typeorm";
import { AttReport } from "src/db/entities/AttReport.entity";
import { CommonReportData } from "@shared/utils/report/types";
import studentReportCard from "../reports/studentReportCard";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import studentReportCardReact from "src/reports/studentReportCardReact";
import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { getUserIdFromUser } from "@shared/auth/auth.util";

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
                    userId: getUserIdFromUser(req.auth),
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