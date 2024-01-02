import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { BaseReportGenerator } from "@shared/utils/report/report.generators";
import { IReportParams } from "./studentReportCardReact";

export function generateStudentReportCard(userId: any, reqExtra: any, generator: BaseReportGenerator) {
    const extraParams: Partial<IReportParams> = {
        year: reqExtra.year ?? getCurrentHebrewYear(),
        grades: reqExtra.grades,
        personalNote: reqExtra.personalNote,
        groupByKlass: reqExtra.groupByKlass,
        hideAbsTotal: reqExtra.hideAbsTotal,
        forceGrades: reqExtra.forceGrades,
        forceAtt: reqExtra.forceAtt,
        showStudentTz: reqExtra.showStudentTz,
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
