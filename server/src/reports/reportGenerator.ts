import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { BaseReportGenerator } from "@shared/utils/report/report.generators";
import { IReportParams } from "./studentReportCardReact";
import { CrudRequest } from "@dataui/crud";
import teacherReportFile, { TeacherReportFileData, TeacherReportFileParams } from "src/reports/teacherReportFile";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { getMailAddressForEntity } from "@shared/utils/mail/mail-address.util";
import { FormatString } from "@shared/utils/yemot/yemot.interface";
import { DataSource } from "typeorm";
import { MailSendService } from "@shared/utils/mail/mail-send.service";
import { sendBulkTeacherMailWithFile } from "@shared/utils/report/bulk-mail-file.util";
import { getAsArray, getAsBoolean, getAsNumber, getAsString } from "@shared/utils/queryParam.util";

export function generateStudentReportCard(userId: any, reqExtra: any, generator: BaseReportGenerator) {
    const extraParams: Partial<IReportParams> = {
        year: reqExtra.year ?? getCurrentHebrewYear(),
        startDate: getAsString(reqExtra.startDate),
        endDate: getAsString(reqExtra.endDate),
        globalLessonReferenceIds: getAsString(reqExtra.globalLessonReferenceIds),
        denyLessonReferenceIds: getAsString(reqExtra.denyLessonReferenceIds),
        klassTypeReferenceId: getAsString(reqExtra.klassTypeReferenceId),
        attendance: getAsBoolean(reqExtra.attendance),
        grades: getAsBoolean(reqExtra.grades),
        personalNote: getAsString(reqExtra.personalNote),
        groupByKlass: getAsBoolean(reqExtra.groupByKlass),
        hideAbsTotal: getAsBoolean(reqExtra.hideAbsTotal),
        minimalReport: getAsBoolean(reqExtra.minimalReport),
        forceGrades: getAsBoolean(reqExtra.forceGrades),
        forceAtt: getAsBoolean(reqExtra.forceAtt),
        showStudentTz: getAsBoolean(reqExtra.showStudentTz),
        downComment: getAsBoolean(reqExtra.downComment),
        lastGrade: getAsBoolean(reqExtra.lastGrade),
        debug: getAsBoolean(reqExtra.debug),
        attendanceLessThan: getAttPercentLessThanParam(reqExtra.attendanceLessThan),
    };
    console.log('student report card extra params: ', extraParams);
    const params = getAsArray(reqExtra.ids)
        ?.map(id => ({
            userId,
            studentId: id,
            ...extraParams
        }));
    return {
        generator,
        params,
    };
}

function getAttPercentLessThanParam(attendanceLessThanStr: string): number {
    if (attendanceLessThanStr) {
        const attLessThanNum = parseInt(attendanceLessThanStr);
        if (!isNaN(attLessThanNum)) {
            return attLessThanNum / 100;
        }
    }
    return undefined;
}

export function getTeacherStatusFileReportParams(req: CrudRequest<any, any>): TeacherReportFileParams[] {
    console.log('teacher report file params: ', req.parsed.extra);
    const isGrades = getAsBoolean(req.parsed.extra?.isGrades);
    const lessonReferenceId = getAsNumber(req.parsed.extra?.lessonReferenceId);
    const params = getAsArray(req.parsed.extra.ids)
        ?.map(id => ({
            userId: getUserIdFromUser(req.auth),
            id,
            isGrades,
            lessonReferenceId,
        }));
    return params;
}

export async function sendTeacherReportFileMail(req: CrudRequest<any, any>, dataSource: DataSource, mailSendService: MailSendService): Promise<string> {
    const params = getTeacherStatusFileReportParams(req);
    const generator = teacherReportFile;
    const targetEntity = getAsBoolean(req.parsed.extra?.isGrades) ? 'grade' : 'att_report';
    const getEmailParamsFromData = async (params: TeacherReportFileParams, data: TeacherReportFileData[]) => {
        const replyToAddress = await getMailAddressForEntity(params.userId, targetEntity, dataSource);
        const textParams = [data[0].teacher.name, data[0].teacherReportStatus.reportMonthName, data.map(item => item.lesson.name).join(', ')];
        const mailSubject = FormatString(req.parsed.extra.mailSubject, textParams);
        const mailBody = FormatString(req.parsed.extra.mailBody, textParams);
        return {
            replyToAddress,
            mailSubject,
            mailBody,
        };
    }
    return sendBulkTeacherMailWithFile(generator, params, req.auth, dataSource, mailSendService, getEmailParamsFromData);
}
