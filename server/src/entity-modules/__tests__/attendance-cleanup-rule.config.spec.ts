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
    function makeService(rules: Partial<AttendanceCleanupRule>[]) {
      const ServiceClass = attendanceCleanupRuleConfig.service as any;
      const mockRepository = {
        target: AttendanceCleanupRule,
        manager: { transaction: jest.fn((cb) => cb()) },
        metadata: {
          columns: [{ propertyName: 'id' }, { propertyName: 'userId' }],
          connection: { options: { type: 'mysql' } },
          targetName: 'AttendanceCleanupRule',
        },
        find: jest.fn().mockResolvedValue(rules),
      } as any;
      const jobService = { enqueue: jest.fn().mockResolvedValue({ id: 42 }) };
      const service = new ServiceClass(mockRepository, {} as any, jobService);
      return { service, mockRepository, jobService };
    }

    it('applies crudAuth to the id lookup, so a non-admin can only run their own rules', async () => {
      // The mocked find simulates the DB applying { userId: 7 } - a non-owned id in the
      // selection simply doesn't come back, instead of being trusted from the request.
      const { service, mockRepository, jobService } = makeService([{ id: 1, userId: 7 }]);
      const req = {
        auth: { id: 7, permissions: {} },
        parsed: { extra: { action: 'runNow', ids: '1,2' } }, // 2 belongs to another user
      } as unknown as CrudRequest;

      await service.doAction(req, {});

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything(), userId: 7 } });
      expect(jobService.enqueue).toHaveBeenCalledTimes(1);
      expect(jobService.enqueue).toHaveBeenCalledWith(7, 'attendance-cleanup-sweep', { ruleIds: [1] });
    });

    it('enqueues nothing when none of the selected ids resolve for this caller', async () => {
      const { service, jobService } = makeService([]);
      const req = {
        auth: { id: 7, permissions: {} },
        parsed: { extra: { action: 'runNow', ids: '99' } }, // owned by someone else
      } as unknown as CrudRequest;

      const message = await service.doAction(req, {});

      expect(jobService.enqueue).not.toHaveBeenCalled();
      expect(message).toContain('0');
    });

    it('enqueues one job per distinct owner when an admin selects rules across users', async () => {
      const { service, mockRepository, jobService } = makeService([
        { id: 1, userId: 38 },
        { id: 2, userId: 39 },
      ]);
      const req = {
        auth: { id: -1, permissions: { admin: true } },
        parsed: { extra: { action: 'runNow', ids: '1,2' } },
      } as unknown as CrudRequest;

      const message = await service.doAction(req, {});

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything() } }); // no userId - admin sees all
      expect(jobService.enqueue).toHaveBeenCalledTimes(2);
      expect(jobService.enqueue).toHaveBeenCalledWith(38, 'attendance-cleanup-sweep', { ruleIds: [1] });
      expect(jobService.enqueue).toHaveBeenCalledWith(39, 'attendance-cleanup-sweep', { ruleIds: [2] });
      expect(message).toContain('42');
    });

    it('falls through to the base doAction for unknown actions', async () => {
      const { service } = makeService([]);
      const req = {
        auth: { id: 7 },
        parsed: { extra: { action: 'somethingElse' } },
      } as unknown as CrudRequest;

      const result = await service.doAction(req, {});
      expect(result).toBe('done nothing');
    });
  });
});
