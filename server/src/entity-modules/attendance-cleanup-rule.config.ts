import { CrudRequest } from '@dataui/crud';
import { In, Repository } from 'typeorm';
import { CrudAuthWithPermissionsFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity, InjectEntityRepository } from '@shared/base-entity/interface';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { JobService } from '@shared/utils/jobs/job.service';
import { getAsNumberArray } from '@shared/utils/queryParam.util';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';

class AttendanceCleanupRuleService<T extends Entity | AttendanceCleanupRule> extends BaseEntityService<T> {
  constructor(
    @InjectEntityRepository private readonly ruleRepo: Repository<T>,
    mailSendService: MailSendService,
    private readonly jobService: JobService,
  ) {
    super(ruleRepo, mailSendService);
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const extra = req.parsed.extra as any;
    switch (extra.action) {
      case 'runNow': {
        const ruleIds = getAsNumberArray(extra.ids) ?? [];
        // The job must be scoped to each rule's own userId, not the requester's - both
        // admins and anyone else with the attendanceCleanupRules permission can see and
        // select rules belonging to any user (CrudAuthWithPermissionsFilter grants full
        // visibility, not just-your-own-rows), so the requester's userId (undefined for
        // admin) is not a valid stand-in.
        const rules = (await this.ruleRepo.find({ where: { id: In(ruleIds) } as any })) as unknown as AttendanceCleanupRule[];
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
    crudAuth: CrudAuthWithPermissionsFilter(permissions => permissions?.attendanceCleanupRules),
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
