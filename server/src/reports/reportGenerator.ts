import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { BaseReportGenerator } from "@shared/utils/report/report.generators";

export function generateStudentReportCard(userId: any, reqExtra: any, generator: BaseReportGenerator) {
    const extraParams = {
        year: reqExtra.year ?? getCurrentHebrewYear(),
        grades: reqExtra.grades,
    };
    const params = reqExtra.ids
        .toString()
        .split(',')
        .map(id => ({
            userId,
            studentId: id,
            ...extraParams
        }));
    return {
        generator,
        params,
    };
}
