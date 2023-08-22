import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { Grade } from "src/db/entities/Grade.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Grade,
        exporter: {
            getImportDefinition(importFields) {
                return {
                    importFields: [
                        'klassId',
                        'studentTz',
                        '',
                        'grade',
                        'comments',
                    ],
                    specialFields: [
                        { cell: { c: 2, r: 0 }, value: 'teacherId' },
                        { cell: { c: 2, r: 1 }, value: 'lessonId' },
                    ],
                };
            }
        }
    }
}

export default getConfig();