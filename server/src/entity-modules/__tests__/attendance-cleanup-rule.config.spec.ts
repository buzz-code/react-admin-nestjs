import { CrudRequest } from '@dataui/crud';
import { ADMIN_FILTER, CrudAuthFilter } from '@shared/auth/crud-auth.filter';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';
import attendanceCleanupRuleConfig from '../attendance-cleanup-rule.config';

describe('AttendanceCleanupRuleConfig', () => {
  it('should have correct base configuration', () => {
    expect(attendanceCleanupRuleConfig.entity).toBe(AttendanceCleanupRule);
    expect(attendanceCleanupRuleConfig.query.join).toEqual(
      expect.objectContaining({
        lesson: { eager: false },
        klass: { eager: false },
      }),
    );
    expect(attendanceCleanupRuleConfig.service).toBeDefined();
  });

  describe('crudAuth', () => {
    // Same as most entities: admin sees everything, everyone else sees only their own
    // rows. The attendanceCleanupRules permission gates client-side visibility only - it
    // must not grant one user's data to another.
    it('uses the standard CrudAuthFilter (admin sees all, others see only their own rows)', () => {
      expect(attendanceCleanupRuleConfig.crudAuth).toBe(CrudAuthFilter);
    });

    it('grants an admin full visibility', () => {
      const user = { permissions: { admin: true } };
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual(ADMIN_FILTER);
    });

    it('scopes a non-admin to their own rows', () => {
      const user = { id: 38, permissions: {} };
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual({ userId: 38 });
    });
  });

  describe('doAction: runNow', () => {
    function makeService() {
      const ServiceClass = attendanceCleanupRuleConfig.service as any;
      const mockRepository = {
        target: AttendanceCleanupRule,
        manager: { transaction: jest.fn((cb) => cb()) },
        metadata: {
          columns: [{ propertyName: 'id' }, { propertyName: 'userId' }],
          connection: { options: { type: 'mysql' } },
          targetName: 'AttendanceCleanupRule',
        },
      } as any;
      const jobService = { enqueue: jest.fn().mockResolvedValue({ id: 42 }) };
      const service = new ServiceClass(mockRepository, {} as any, jobService);
      return { service, jobService };
    }

    function makeReq(ids: string, rules: Partial<AttendanceCleanupRule>[]) {
      // getManyByIds is what actually applies crudAuth's filter (via createBuilder) - it's
      // mocked here rather than re-testing that plumbing, which base-entity.service.spec.ts
      // already covers directly.
      const req = {
        auth: { id: -1, permissions: { admin: true } },
        parsed: { extra: { action: 'runNow', ids } },
        options: {},
      } as unknown as CrudRequest;
      return req;
    }

    it("enqueues a job scoped to the resolved rules' own userId", async () => {
      const { service, jobService } = makeService();
      jest.spyOn(service, 'getManyByIds').mockResolvedValue([
        { id: 1, userId: 38 },
        { id: 2, userId: 38 },
      ] as any);
      const req = makeReq('1,2', []);

      const message = await service.doAction(req, {});

      expect(service.getManyByIds).toHaveBeenCalledWith(req, [1, 2]);
      expect(jobService.enqueue).toHaveBeenCalledTimes(1);
      expect(jobService.enqueue).toHaveBeenCalledWith(38, 'attendance-cleanup-sweep', { ruleIds: [1, 2] });
      expect(message).toContain('42');
    });

    it('enqueues nothing when none of the selected ids resolve for this caller', async () => {
      const { service, jobService } = makeService();
      jest.spyOn(service, 'getManyByIds').mockResolvedValue([]);
      const req = makeReq('99', []); // e.g. owned by someone else, filtered out by crudAuth

      const message = await service.doAction(req, {});

      expect(jobService.enqueue).not.toHaveBeenCalled();
      expect(message).toContain('0');
    });

    it('enqueues one job per distinct owner when the resolved rules span multiple users', async () => {
      const { service, jobService } = makeService();
      jest.spyOn(service, 'getManyByIds').mockResolvedValue([
        { id: 1, userId: 38 },
        { id: 2, userId: 39 },
      ] as any);
      const req = makeReq('1,2', []);

      await service.doAction(req, {});

      expect(jobService.enqueue).toHaveBeenCalledTimes(2);
      expect(jobService.enqueue).toHaveBeenCalledWith(38, 'attendance-cleanup-sweep', { ruleIds: [1] });
      expect(jobService.enqueue).toHaveBeenCalledWith(39, 'attendance-cleanup-sweep', { ruleIds: [2] });
    });

    it('falls through to the base doAction for unknown actions', async () => {
      const { service } = makeService();
      const req = {
        auth: { id: 7 },
        parsed: { extra: { action: 'somethingElse' } },
      } as unknown as CrudRequest;

      const result = await service.doAction(req, {});
      expect(result).toBe('done nothing');
    });
  });
});
