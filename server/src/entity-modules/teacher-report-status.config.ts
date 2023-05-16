import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { TeacherReportStatus } from "src/db/view-entities/TeacherReportStatus.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: TeacherReportStatus,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacherName', label: 'מורה' },
                    { value: 'reportMonthName', label: 'תקופת דיווח' },
                    { value: 'reportedLessons', label: 'שיעורים שדווחו' },
                    { value: 'notReportedLessons', label: 'שיעורים שלא דווחו' },
                ];
            }
        },
    }
}

export default getConfig();