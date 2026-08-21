import { CrudRequest } from '@dataui/crud';
import { Repository } from 'typeorm';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { CrudAuthWithPermissionsFilter } from '@shared/auth/crud-auth.filter';
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
        const userId = getUserIdFromUser(req.auth);
        const ruleIds = getAsNumberArray(extra.ids) ?? [];
        const job = await this.jobService.enqueue(userId, 'attendance-cleanup-sweep', { ruleIds });
        return `נוצרה משימת ניקוי נוכחות (מזהה ${job.id})`;
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
