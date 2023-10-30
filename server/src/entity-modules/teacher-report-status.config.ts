import { CrudRequest } from "@dataui/crud";
import { ISendMailOptions } from "@nestjs-modules/mailer";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { BulkToZipReportGenerator, DataToExcelReportGenerator } from "@shared/utils/report/report.generators";
import { CommonReportData } from "@shared/utils/report/types";
import { TeacherReportStatus } from "src/db/view-entities/TeacherReportStatus.entity";
import teacherReportFile, { TeacherReportFileData } from "src/reports/teacherReportFile";
import * as JSZip from 'jszip';
import { getUserMailAddressFrom, validateUserHasPaid } from "@shared/base-entity/base-entity.util";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { getMailAddressForEntity } from "@shared/utils/mail/mail-address.util";
import { FormatString } from "@shared/utils/yemot/yemot.interface";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: TeacherReportStatus,
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
        service: TeacherReportStatusService,
    }
}

class TeacherReportStatusService<T extends Entity | TeacherReportStatus> extends BaseEntityService<T> {
    reportsDict = {
        teacherReportFile: new BulkToZipReportGenerator(() => 'קבצי נוכחות למורות', teacherReportFile),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = getReportParams(req);
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>): Promise<any> {
        const params = getReportParams(req);
        switch (req.parsed.extra.action) {
            case 'teacherReportFile': {
                if (params.length > 1) {
                    await validateUserHasPaid(req.auth, this.dataSource, 'בחשבון חינמי אפשר לשלוח רק מייל אחד בכל פעם');
                }

                const generator = teacherReportFile;
                for (const p of params) {
                    try {
                        const filesData = (await generator.getReportData(p, this.dataSource)) as TeacherReportFileData[];
                        if (filesData[0]?.teacher?.email) {
                            const zipFileBuffer = await generator.getFileBuffer(filesData);
                            const zipContent = await JSZip.loadAsync(zipFileBuffer);

                            const attachments: ISendMailOptions['attachments'] = await Promise.all(
                                Object.values(zipContent.files)
                                    .map(
                                        async (file) => ({
                                            filename: file.name,
                                            content: await file.async('nodebuffer')
                                        })
                                    )
                            );

                            const fromAddress = await getUserMailAddressFrom(req.auth, this.dataSource);
                            const targetEntity = req.parsed.extra?.isGrades ? 'grade' : 'att_report';
                            const replyToAddress = await getMailAddressForEntity(p.userId, targetEntity, this.dataSource);
                            const textParams = [filesData[0].teacher.name, filesData[0].teacherReportStatus.reportMonthName, filesData.map(item => item.lesson.name).join(', ')];
                            const mailSubject = FormatString(req.parsed.extra.mailSubject, textParams);
                            const mailBody = FormatString(req.parsed.extra.mailBody, textParams);

                            await this.mailSendService.sendMail({
                                to: filesData[0].teacher.email,
                                from: fromAddress,
                                subject: mailSubject,
                                html: mailBody,
                                attachments,
                                replyTo: {
                                    address: replyToAddress,
                                    name: fromAddress.name,
                                },
                            });
                        }
                    } catch (e) {
                        console.log('error sending teacher report', e);
                    }
                }
                return 'OK';
            }
        }
        return super.doAction(req);
    }
}

function getReportParams(req: CrudRequest<any, any>) {
    const params = req.parsed.extra.ids
        .toString()
        .split(',')
        .map(id => ({
            userId: getUserIdFromUser(req.auth),
            id,
            isGrades: req.parsed.extra?.isGrades,
        }));
    return params;
}

export default getConfig();