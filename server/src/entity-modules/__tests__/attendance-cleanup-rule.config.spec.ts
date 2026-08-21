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

    it('enqueues an attendance-cleanup-sweep job scoped to the selected rule ids', async () => {
      const { service, jobService } = makeService();
      const req = {
        auth: { id: 7 },
        parsed: { extra: { action: 'runNow', ids: '1,2' } },
      } as unknown as CrudRequest;

      const message = await service.doAction(req, {});

      expect(jobService.enqueue).toHaveBeenCalledWith(7, 'attendance-cleanup-sweep', { ruleIds: [1, 2] });
      expect(message).toContain('42');
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
