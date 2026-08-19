import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Not } from 'typeorm';
import { Job } from '@shared/entities/Job.entity';
import { JobHandler, JobResult } from '@shared/utils/jobs/job.types';
import { getHebrewYearByGregorianDate } from '@shared/utils/entity/year.util';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';

/**
 * For each active AttendanceCleanupRule owned by the job's user (or a
 * specific subset via payload.ruleIds, for the "run now" button), and for
 * each of the last `weeksBack` occurrences of `dayOfWeek`, deletes
 * att_reports for that lesson+date belonging to any klass OTHER than the
 * one being preserved.
 *
 * lessonId/klassId on the rule are Lesson.key/Klass.key (stable across
 * years) — re-resolved against the target date's own academic year here,
 * not against a fixed referenceId, so a rule keeps working after a new
 * school year's Lesson/Klass rows get created with fresh ids.
 */
@Injectable()
export class AttendanceCleanupSweepHandler implements JobHandler {
  readonly type = 'attendance-cleanup-sweep';
  private readonly logger = new Logger(AttendanceCleanupSweepHandler.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async handle(job: Job): Promise<JobResult> {
    const ruleRepo = this.dataSource.getRepository(AttendanceCleanupRule);
    const ruleIds: number[] = job.payload?.ruleIds ?? [];

    const rules = await ruleRepo.find({
      where: ruleIds.length
        ? { userId: job.userId, id: In(ruleIds) }
        : { userId: job.userId, active: true },
    });

    let totalDeleted = 0;
    const perRule: string[] = [];

    for (const rule of rules) {
      const targetDates = getTargetDates(rule.dayOfWeek, rule.weeksBack);
      let ruleDeleted = 0;
      const skipped: string[] = [];

      for (const date of targetDates) {
        const year = getHebrewYearByGregorianDate(date);
        const lesson = await this.dataSource
          .getRepository(Lesson)
          .findOne({ where: { userId: job.userId, key: rule.lessonId, year } });
        const preserveKlass = await this.dataSource
          .getRepository(Klass)
          .findOne({ where: { userId: job.userId, key: rule.klassId, year } });

        if (!lesson || !preserveKlass) {
          skipped.push(date.toISOString().slice(0, 10));
          continue;
        }

        const result = await this.dataSource.getRepository(AttReport).delete({
          userId: job.userId,
          lessonReferenceId: lesson.id,
          reportDate: date,
          klassReferenceId: Not(preserveKlass.id),
        });
        ruleDeleted += result.affected ?? 0;
      }

      totalDeleted += ruleDeleted;
      const label = rule.name || `כלל ${rule.id}`;
      perRule.push(
        skipped.length
          ? `${label}: נמחקו ${ruleDeleted} (דולג על ${skipped.join(', ')} - שיעור/כיתה לא נמצאו לאותה שנה)`
          : `${label}: נמחקו ${ruleDeleted}`,
      );
    }

    this.logger.log(`attendance-cleanup-sweep: ${rules.length} rules, ${totalDeleted} att_reports deleted`);

    return {
      summary: `נמחקו ${totalDeleted} רשומות נוכחות (${rules.length} כללים)`,
      rulesProcessed: rules.length,
      totalDeleted,
      perRule,
    };
  }
}

/**
 * The last `weeksBack` occurrences of `dayOfWeek` (0=Sun..6=Sat), most
 * recent first, including today if today is that weekday.
 */
export function getTargetDates(dayOfWeek: number, weeksBack: number, now: Date = new Date()): Date[] {
  const diffToMostRecent = (now.getDay() - dayOfWeek + 7) % 7;
  const mostRecent = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMostRecent);

  const dates: Date[] = [];
  for (let i = 0; i < weeksBack; i++) {
    dates.push(new Date(mostRecent.getFullYear(), mostRecent.getMonth(), mostRecent.getDate() - i * 7));
  }
  return dates;
}
