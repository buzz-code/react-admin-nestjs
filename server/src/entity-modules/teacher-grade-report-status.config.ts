import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { BulkToZipReportGenerator } from "@shared/utils/report/bulk-to-zip.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { TeacherGradeReportStatus } from "src/db/view-entities/TeacherGradeReportStatus.entity";
import teacherReportFile from "src/reports/teacherReportFile";
import { getTeacherStatusFileReportParams, sendTeacherReportFileMail } from "src/reports/reportGenerator";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: TeacherGradeReportStatus,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacherName', label: 'מורה' },
                    { value: 'reportMonthName', label: 'תקופת דיווח' },
                    { value: 'reportedLessonNames', label: 'שיעורים שדווחו' },
                    { value: 'notReportedLessonNames', label: 'שיעורים שלא דווחו' },
                ];
            }
        },
        service: TeacherGradeReportStatusService,
    }
}

class TeacherGradeReportStatusService<T extends Entity | TeacherGradeReportStatus> extends BaseEntityService<T> {
    reportsDict = {
        teacherReportFile: new BulkToZipReportGenerator(() => 'קבצי ציונים למורות', teacherReportFile),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            req.parsed.extra.isGrades = true;
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = getTeacherStatusFileReportParams(req);
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'teacherReportFile': {
                req.parsed.extra.isGrades = true;
                return sendTeacherReportFileMail(req, this.dataSource, this.mailSendService);
            }
        }
        return super.doAction(req);
    }
}

export default getConfig();