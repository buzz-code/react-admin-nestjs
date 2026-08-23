import { CrudRequest } from '@dataui/crud';
import { ADMIN_FILTER, NO_DATA_FILTER } from '@shared/auth/crud-auth.filter';
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
    it('grants access to a user with the attendanceCleanupRules permission', () => {
      const user = { permissions: { attendanceCleanupRules: true } };
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual(ADMIN_FILTER);
    });

    it('grants access to an admin regardless of the dedicated permission', () => {
      const user = { permissions: { admin: true } };
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual(ADMIN_FILTER);
    });

    it('denies a user lacking the permission (no rows, not a 403)', () => {
      const user = { permissions: {} };
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual(NO_DATA_FILTER);
    });

    it('denies a user with no permissions object at all', () => {
      const user = {};
      expect(attendanceCleanupRuleConfig.crudAuth.filter(user)).toEqual(NO_DATA_FILTER);
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

    it("enqueues a job scoped to the selected rules' own userId (not the requester's)", async () => {
      // The requester (e.g. admin) has no userId of their own for this purpose -
      // CrudAuthWithPermissionsFilter lets them select rules owned by anyone.
      const { service, mockRepository, jobService } = makeService([
        { id: 1, userId: 38 },
        { id: 2, userId: 38 },
      ]);
      const req = {
        auth: { id: -1, permissions: { admin: true } },
        parsed: { extra: { action: 'runNow', ids: '1,2' } },
      } as unknown as CrudRequest;

      const message = await service.doAction(req, {});

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
      expect(jobService.enqueue).toHaveBeenCalledTimes(1);
      expect(jobService.enqueue).toHaveBeenCalledWith(38, 'attendance-cleanup-sweep', { ruleIds: [1, 2] });
      expect(message).toContain('42');
    });

    it('enqueues one job per distinct owner when selected rules belong to different users', async () => {
      const { service, jobService } = makeService([
        { id: 1, userId: 38 },
        { id: 2, userId: 39 },
      ]);
      const req = {
        auth: { id: -1, permissions: { admin: true } },
        parsed: { extra: { action: 'runNow', ids: '1,2' } },
      } as unknown as CrudRequest;

      await service.doAction(req, {});

      expect(jobService.enqueue).toHaveBeenCalledTimes(2);
      expect(jobService.enqueue).toHaveBeenCalledWith(38, 'attendance-cleanup-sweep', { ruleIds: [1] });
      expect(jobService.enqueue).toHaveBeenCalledWith(39, 'attendance-cleanup-sweep', { ruleIds: [2] });
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
