import { CrudRequest } from '@dataui/crud';
import { Repository } from 'typeorm';
import { CrudAuthFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity, InjectEntityRepository } from '@shared/base-entity/interface';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { getAsNumberArray } from '@shared/utils/queryParam.util';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';
import { runCleanupRules } from 'src/jobs/attendance-cleanup-sweep.handler';

class AttendanceCleanupRuleService<T extends Entity | AttendanceCleanupRule> extends BaseEntityService<T> {
  constructor(
    @InjectEntityRepository repo: Repository<T>,
    mailSendService: MailSendService,
  ) {
    super(repo, mailSendService);
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const extra = req.parsed.extra;
    switch (extra.action) {
      case 'runNow':
      case 'preview': {
        const ruleIds = getAsNumberArray(extra.ids) ?? [];
        // getManyByIds applies crudAuth's filter (already merged into req.parsed.search
        // by CrudRequestInterceptor) - a non-owned id in the selection simply doesn't
        // come back, instead of being trusted from the request.
        const rules = (await this.getManyByIds(req, ruleIds)) as unknown as AttendanceCleanupRule[];
        const dryRun = extra.action === 'preview';
        // Admin sees everyone, so a selection can still span multiple owners - run
        // each owner's rules under its own userId.
        const userIds = [...new Set(rules.map((rule) => rule.userId))];
        let totalDeleted = 0;
        const perRule: string[] = [];
        for (const userId of userIds) {
          const result = await runCleanupRules(
            this.dataSource,
            userId,
            rules.filter((rule) => rule.userId === userId),
            dryRun,
          );
          totalDeleted += result.totalDeleted;
          perRule.push(...result.perRule);
        }
        const header = dryRun
          ? `תצוגה מקדימה, לא נמחק כלום. יימחקו ${totalDeleted} רשומות נוכחות`
          : `נמחקו ${totalDeleted} רשומות נוכחות`;
        return [header, ...perRule].join('\n');
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
