import { MigrationInterface, QueryRunner } from "typeorm";
import { ImportFile } from "@shared/entities/ImportFile.entity";
import { Not, IsNull } from "typeorm";

export class UpdateLessonTimeToStartTime1761669384732 implements MigrationInterface {
    name = 'UpdateLessonTimeToStartTime1761669384732'

    private async migrateLessonTime(
        queryRunner: QueryRunner,
        transformFn: (details: any) => boolean
    ): Promise<void> {
        const importFileRepository = queryRunner.manager.getRepository(ImportFile);

        // Get all ImportFile records with metadata (we'll filter in memory)
        const importFiles = await importFileRepository.find({
            where: {
                metadata: Not(IsNull())
            },
            select: ['id', 'metadata']
        });

        // Filter records that have dateDetails in metadata
        const filesWithDateDetails = importFiles.filter(file => {
            const metadata = file.metadata as any;
            return metadata && metadata.dateDetails;
        });

        for (const file of filesWithDateDetails) {
            const metadata = file.metadata as any;
            let hasChanges = false;

            if (metadata.dateDetails) {
                for (const [date, details] of Object.entries(metadata.dateDetails)) {
                    if (transformFn(details)) {
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges) {
                await importFileRepository.update(file.id, {
                    metadata: metadata
                });
            }
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.migrateLessonTime(queryRunner, (details: any) => {
            if (details.lessonTime && !details.lessonStartTime) {
                details.lessonStartTime = details.lessonTime;
                delete details.lessonTime;
                return true;
            }
            return false;
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.migrateLessonTime(queryRunner, (details: any) => {
            if (details.lessonStartTime && !details.lessonTime) {
                details.lessonTime = details.lessonStartTime;
                delete details.lessonStartTime;
                return true;
            }
            return false;
        });
    }
}