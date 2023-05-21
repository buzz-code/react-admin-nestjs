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
            const params = req.parsed.extra.ids
                .toString()
                .split(',')
                .map(id => ({ userId: req.auth.id, id }));
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>): Promise<any> {
        const params = req.parsed.extra.ids
            .toString()
            .split(',')
            .map(id => ({ userId: req.auth.id, id }));
        switch (req.parsed.extra.action) {
            case 'teacherReportFile': {
                await validateUserHasPaid(req.auth, this.dataSource);

                const generator = teacherReportFile;
                for (const p of params) {
                    try {
                        const data = (await generator.getReportData(p, this.dataSource)) as TeacherReportFileData[];
                        if (data.length) {
                            if (data[0].teacher.email) {
                                const zipFileBuffer = await generator.getFileBuffer(data);
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
                                await this.mailSendService.sendMail({
                                    to: data[0].teacher.email,
                                    from: fromAddress,
                                    subject: 'קבצי נוכחות למילוי',
                                    html: req.parsed.extra.mailBody ?? 'מורה יקרה, מצורפים קבצים',
                                    attachments,
                                });
                            }
                        }
                    } catch (e) {
                        console.log('error sending teacher report', e)
                    }
                }
                return 'OK';
            }
        }
        return super.doAction(req);
    }
}

export default getConfig();