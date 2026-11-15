import { CrudRequest } from '@dataui/crud';
import { ADMIN_FILTER, CrudAuthFilter } from '@shared/auth/crud-auth.filter';
import { AttendanceCleanupRule } from 'src/db/entities/AttendanceCleanupRule.entity';
import attendanceCleanupRuleConfig from '../attendance-cleanup-rule.config';

const mockRunCleanupRules = jest.fn();
jest.mock('src/jobs/attendance-cleanup-sweep.handler', () => ({
  runCleanupRules: (...args: any[]) => mockRunCleanupRules(...args),
}));

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

  describe('doAction: runNow / preview', () => {
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
      const service = new ServiceClass(mockRepository, {} as any);
      service.dataSource = { name: 'ds' };
      return { service };
    }

    function makeReq(ids: string, action = 'runNow') {
      // getManyByIds is what actually applies crudAuth's filter (via createBuilder) - it's
      // mocked here rather than re-testing that plumbing, which base-entity.service.spec.ts
      // already covers directly.
      const req = {
        auth: { id: -1, permissions: { admin: true } },
        parsed: { extra: { action, ids } },
        options: {},
      } as unknown as CrudRequest;
      return req;
    }

    beforeEach(() => {
      mockRunCleanupRules.mockReset();
      mockRunCleanupRules.mockImplementation(async (_ds, _userId, rules) => ({
        totalDeleted: rules.length,
        perRule: rules.map((rule) => `כלל ${rule.id}: נמחקו 1`),
      }));
    });

    it("runs the resolved rules under their own userId and returns the summary", async () => {
      const { service } = makeService();
      const rules = [
        { id: 1, userId: 38 },
        { id: 2, userId: 38 },
      ];
      jest.spyOn(service, 'getManyByIds').mockResolvedValue(rules as any);
      const req = makeReq('1,2');

      const message = await service.doAction(req, {});

      expect(service.getManyByIds).toHaveBeenCalledWith(req, [1, 2]);
      expect(mockRunCleanupRules).toHaveBeenCalledTimes(1);
      expect(mockRunCleanupRules).toHaveBeenCalledWith(service.dataSource, 38, rules, false);
      expect(message).toContain('נמחקו 2');
      expect(message).toContain('כלל 1: נמחקו 1');
    });

    it('runs nothing when none of the selected ids resolve for this caller', async () => {
      const { service } = makeService();
      jest.spyOn(service, 'getManyByIds').mockResolvedValue([]);
      const req = makeReq('99'); // e.g. owned by someone else, filtered out by crudAuth

      const message = await service.doAction(req, {});

      expect(mockRunCleanupRules).not.toHaveBeenCalled();
      expect(message).toContain('0');
    });

    it('runs once per distinct owner when the resolved rules span multiple users', async () => {
      const { service } = makeService();
      jest.spyOn(service, 'getManyByIds').mockResolvedValue([
        { id: 1, userId: 38 },
        { id: 2, userId: 39 },
      ] as any);

      await service.doAction(makeReq('1,2'), {});

      expect(mockRunCleanupRules).toHaveBeenCalledTimes(2);
      expect(mockRunCleanupRules).toHaveBeenCalledWith(service.dataSource, 38, [{ id: 1, userId: 38 }], false);
      expect(mockRunCleanupRules).toHaveBeenCalledWith(service.dataSource, 39, [{ id: 2, userId: 39 }], false);
    });

    it('preview runs as a dry run and says nothing was deleted', async () => {
      const { service } = makeService();
      const rules = [{ id: 1, userId: 38 }];
      jest.spyOn(service, 'getManyByIds').mockResolvedValue(rules as any);

      const message = await service.doAction(makeReq('1', 'preview'), {});

      expect(mockRunCleanupRules).toHaveBeenCalledWith(service.dataSource, 38, rules, true);
      expect(message).toContain('לא נמחק כלום');
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
