import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { getHebrewBooleanFormatter } from "@shared/utils/formatting/formatter.util";
import { Student } from "src/db/entities/Student.entity";
import { CommonReportData } from "@shared/utils/report/types";
import studentReportCard from "../reports/studentReportCard";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import studentReportCardReact from "src/reports/studentReportCardReact";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { generateStudentReportCard } from "src/reports/reportGenerator";
import { In } from "typeorm";
import { getAsArray, getAsBoolean } from "src/utils/queryParam.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Student,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'tz', label: 'תז' },
                    { value: 'name', label: 'שם' },
                    { value: 'comment', label: 'הערה' },
                    { value: 'phone', label: 'טלפון' },
                    { value: 'year', label: 'כתובת' },
                    { value: getHebrewBooleanFormatter('isActive'), label: 'פעיל' },
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
            const userId = getUserIdFromUser(req.auth);
            const generator = this.reportsDict[req.parsed.extra.report];
            return generateStudentReportCard(userId, req.parsed.extra, generator);
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'bulkUpdateActive': {
                const ids = getAsArray(req.parsed.extra.ids);
                const isActive = getAsBoolean(req.parsed.extra.isActive) ?? false;
                if (!ids) return 'לא נבחרו רשומות';

                const result = await this.dataSource.getRepository(Student).update(
                    { id: In(ids) },
                    { isActive }
                );

                return `עודכנו ${result.affected} תלמידים`;
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();