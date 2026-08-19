import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { Job } from '@shared/entities/Job.entity';
import { JobHandler, JobResult } from '@shared/utils/jobs/job.types';
import { getDataSource } from '@shared/utils/entity/foreignKey.util';
import { AttReport } from 'src/db/entities/AttReport.entity';

const MAX_LOOKBACK_WEEKS = 52;

interface AttendanceCleanupPayload {
  /** Klass whose attendance is kept - everyone else loses this lesson/date. */
  klassReferenceId: number;
  /** Lesson to clean up (e.g. "תפילה"). */
  lessonReferenceId: number;
  /** 0 = Sunday ... 6 = Saturday - which weekday's attendance is in scope. */
  targetWeekday: number;
  /** How many past occurrences of that weekday to re-check on every run. */
  lookbackWeeks?: number;
}

/**
 * Deletes attendance recorded for a given lesson/weekday from every student
 * outside the configured klass, for the last `lookbackWeeks` occurrences of
 * that weekday. Re-checking a window (not just "today") on every run is what
 * catches attendance entered late - a run scans the same window every time,
 * so a record added after the fact is picked up the next time this job
 * fires, whenever that is. Deleting an already-cleaned date is a no-op, so
 * re-scanning the window each run is safe.
 */
@Injectable()
export class AttendanceCleanupHandler implements JobHandler {
  readonly type = 'attendance-cleanup';

  async handle(job: Job): Promise<JobResult> {
    const payload = (job.payload ?? {}) as AttendanceCleanupPayload;
    const { klassReferenceId, lessonReferenceId, targetWeekday } = payload;

    if (klassReferenceId == null || lessonReferenceId == null || targetWeekday == null) {
      throw new Error(
        'attendance-cleanup job is missing klassReferenceId / lessonReferenceId / targetWeekday in its payload',
      );
    }
    if (targetWeekday < 0 || targetWeekday > 6) {
      throw new Error(`attendance-cleanup targetWeekday must be 0-6 (0=Sunday), got ${targetWeekday}`);
    }

    const weeks = Math.min(MAX_LOOKBACK_WEEKS, Math.max(1, Number(payload.lookbackWeeks) || 1));
    const dates = getPastWeekdayDates(targetWeekday, weeks);

    const dataSource = await getDataSource([AttReport]);
    try {
      const res = await dataSource.getRepository(AttReport).delete({
        userId: job.userId,
        lessonReferenceId,
        klassReferenceId: Not(klassReferenceId),
        reportDate: In(dates),
      });
      const deleted = res.affected ?? 0;
      return {
        summary: `נמחקו ${deleted} רשומות נוכחות (שיעור ${lessonReferenceId}, ${weeks} שבועות אחרונים)`,
        deleted,
        dates: dates.map((d) => d.toISOString().slice(0, 10)),
      };
    } finally {
      await dataSource.destroy();
    }
  }
}

/** Every date matching `weekday` (0=Sun..6=Sat) in the last `weeks` occurrences, most recent first. */
function getPastWeekdayDates(weekday: number, weeks: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffToMostRecent = (today.getDay() - weekday + 7) % 7;
  const mostRecent = new Date(today);
  mostRecent.setDate(today.getDate() - diffToMostRecent);

  const dates: Date[] = [];
  for (let i = 0; i < weeks; i++) {
    const date = new Date(mostRecent);
    date.setDate(mostRecent.getDate() - i * 7);
    dates.push(date);
  }
  return dates;
}
