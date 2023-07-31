import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { Grade } from "src/db/entities/Grade.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Grade,
        exporter: {
            getImportFields(entityColumns) {
                return [
                    'klassId',
                    'studentTz',
                    '',
                    'grade',
                    'comments',
                ];
            },
            getSpecialFields() {
                return [
                    { cell: { c: 2, r: 0 }, value: 'teacherId' },
                    { cell: { c: 2, r: 1 }, value: 'lessonId' },
                ]
            }
        }
    }
}

export default getConfig();