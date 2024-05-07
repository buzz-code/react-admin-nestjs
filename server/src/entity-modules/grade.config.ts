import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { generateCommonFileResponse } from "@shared/utils/report/report.util";
import { Grade } from "src/db/entities/Grade.entity";
import michlolPopulatedFile, { MichlolPopulatedFileParams } from "src/reports/michlolPopulatedFile";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Grade,
        query: {
            join: {
                studentBaseKlass: {},
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
            }
        },
        exporter: {
            getImportDefinition(importFields) {
                return {
                    importFields: [
                        'klassId',
                        'studentTz',
                        '',
                        'grade',
                        'estimation',
                        'comments',
                    ],
                    specialFields: [
                        { cell: { c: 2, r: 0 }, value: 'teacherId' },
                        { cell: { c: 2, r: 1 }, value: 'lessonId' },
                    ],
                    hardCodedFields: [
                        { field: 'reportDate', value: new Date() },
                    ]
                };
            }
        },
        service: GradeService,
    }
}


class GradeService<T extends Entity | Grade> extends BaseEntityService<T> {
    reportsDict = {
        michlolPopulatedFile: michlolPopulatedFile,
    }
    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'michlolPopulatedFile': {
                const generator = this.reportsDict[req.parsed.extra.action];
                const params: MichlolPopulatedFileParams = {
                    userId: getUserIdFromUser(req.auth),
                    michlolFileName: req.parsed.extra.fileName,
                    michlolFileData: body.data,
                }
                return generateCommonFileResponse(generator, params, this.dataSource);
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();