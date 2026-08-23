import { CrudRequest } from '@dataui/crud';
import { Repository } from 'typeorm';
import { CrudAuthFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity, InjectEntityRepository } from '@shared/base-entity/interface';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { JobService } from '@shared/utils/jobs/job.service';
import { getAsNumberArray } from '@shared/utils/queryParam.util';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';

class AttendanceCleanupRuleService<T extends Entity | AttendanceCleanupRule> extends BaseEntityService<T> {
  constructor(
    @InjectEntityRepository repo: Repository<T>,
    mailSendService: MailSendService,
    private readonly jobService: JobService,
  ) {
    super(repo, mailSendService);
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const extra = req.parsed.extra as any;
    switch (extra.action) {
      case 'runNow': {
        const ruleIds = getAsNumberArray(extra.ids) ?? [];
        // getManyByIds applies crudAuth's filter (already merged into req.parsed.search
        // by CrudRequestInterceptor) - a non-owned id in the selection simply doesn't
        // come back, instead of being trusted from the request.
        const rules = (await this.getManyByIds(req, ruleIds)) as unknown as AttendanceCleanupRule[];
        // Admin sees everyone, so a selection can still span multiple owners - scope
        // each enqueued job to its own rule subset.
        const userIds = [...new Set(rules.map((rule) => rule.userId))];
        const jobs = await Promise.all(
          userIds.map((userId) =>
            this.jobService.enqueue(userId, 'attendance-cleanup-sweep', {
              ruleIds: rules.filter((rule) => rule.userId === userId).map((rule) => rule.id),
            }),
          ),
        );
        return `נוצרו ${jobs.length} משימות ניקוי נוכחות (מזהים: ${jobs.map((job) => job.id).join(', ')})`;
      }
    }
    return super.doAction(req, body);
  }
}

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: AttendanceCleanupRule,
    // Same auth as most entities: admin sees everything, everyone else sees only their
    // own rows. The attendanceCleanupRules permission only controls whether the client
    // shows the resource - it must not grant cross-tenant data visibility.
    crudAuth: CrudAuthFilter,
    query: {
      join: {
        lesson: { eager: false },
        klass: { eager: false },
      },
    },
    service: AttendanceCleanupRuleService,
  };
}

export default getConfig();
