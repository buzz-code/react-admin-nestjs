import config from '../att-report-with-report-month.config';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { AttReport } from 'src/db/entities/AttReport.entity';

// Mock BaseEntityService
const mockBaseCreateOne = jest.fn().mockResolvedValue({ id: 1 });
const mockBaseCreateMany = jest.fn().mockResolvedValue([{ id: 1 }]);
const mockBaseConstructor = jest.fn();
const mockGetRelationMetadata = jest.fn();
const mockBaseCreateBuilder = jest.fn().mockResolvedValue('builder');

jest.mock('@shared/base-entity/base-entity.service', () => {
  class MockBaseEntityService {
    dataSource: any;
    constructor(public repo: any, public mailSendService: any) {
      mockBaseConstructor(repo, mailSendService);
    }
    async createOne(req: any, dto: any) {
      return mockBaseCreateOne(req, dto);
    }
    async createMany(req: any, dto: any) {
      return mockBaseCreateMany(req, dto);
    }
    async updateOne(req: any, dto: any) {
      return { id: 1 };
    }
    async deleteOne(req: any) {
      return { id: 1 };
    }
    async getOne(req: any) {
      return { id: 1 };
    }
    async doAction(req: any, body: any) {
      return 'success';
    }
    getRelationMetadata(field: string, options: any) {
      return mockGetRelationMetadata(field, options);
    }
    async createBuilder(parsed: any, options: any, many: boolean, withDeleted: boolean) {
      return mockBaseCreateBuilder(parsed, options, many, withDeleted);
    }
  }
  return {
    BaseEntityService: MockBaseEntityService,
  };
});

describe('att-report-with-report-month.config', () => {
  describe('getConfig', () => {
    it('should return config with proper entity and query settings', () => {
      expect(config.entity).toBe(AttReportWithReportMonth);
      expect(config.query).toBeDefined();
      expect(config.query.join).toEqual({
        studentBaseKlass: { eager: true },
        student: { eager: false },
        teacher: { eager: false },
        lesson: { eager: false },
        klass: { eager: false },
        'klass.klassType': { eager: false },
        reportMonth: { eager: false },
        reportGroupSession: { eager: false },
      });
    });
  });

  describe('Service', () => {
    let service: any;
    let mockDataSource: any;
    let mockRepo: any;

    beforeEach(() => {
      mockRepo = {
        findBy: jest.fn(),
        insert: jest.fn(),
        save: jest.fn(),
        update: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockRepo),
      };

      const ServiceClass = config.service as any;
      // First arg is repo, second is mailService
      service = new ServiceClass(mockRepo, {});
      // Manually inject dataSource as if NestJS did it
      service.dataSource = mockDataSource;

      // Mock getOne on the service instance itself since it calls this.getOne()
      service.getOne = jest.fn().mockResolvedValue({ id: 1, reportDate: '2022-01-01' });
      // By default every selected id is accessible to the caller
      service.getManyByIds = jest.fn().mockImplementation((req, ids) => Promise.resolve(ids.map((id) => ({ id }))));

      mockBaseCreateOne.mockClear();
      mockBaseCreateMany.mockClear();
      mockBaseConstructor.mockClear();
      (BaseEntityService as unknown as jest.Mock).mockClear?.();
    });

    it('createBuilder should resolve the klass relation before the nested klass.klassType filter', async () => {
      const options = { query: { join: config.query.join } };
      const parsed = { filter: [{ field: 'klass.klassType.teacherReferenceId', operator: '$eq', value: 1 }] };

      await expect(service.createBuilder(parsed, options)).resolves.toBe('builder');

      expect(mockGetRelationMetadata).toHaveBeenCalledWith('klass', { eager: false });
      expect(mockGetRelationMetadata.mock.invocationCallOrder[0]).toBeLessThan(
        mockBaseCreateBuilder.mock.invocationCallOrder[0],
      );
      expect(mockBaseCreateBuilder).toHaveBeenCalledWith(parsed, options, true, false);
    });

    it('createOne should delegate to AttReport service', async () => {
      const req = { options: {}, parsed: {} } as any;
      const dto = { reportDate: '2022-01-01' };

      await service.createOne(req, dto);

      // Verify BaseEntityService was instantiated with AttReport repository
      // Note: The first call is in constructor of 'service'.
      // The second call is inside 'createOne'.
      // service = new ServiceClass calls super(), which calls BaseEntityService constructor.
      // THEN service.createOne() calls new BaseEntityService().

      // Expect BaseEntityService to be called with mockRepo (via this.dataSource.getRepository(AttReport))
      expect(mockBaseConstructor).toHaveBeenLastCalledWith(mockRepo, expect.anything());
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(AttReport);

      // Verify createOne was called on the delegate
      expect(mockBaseCreateOne).toHaveBeenCalledWith(req, dto);

      // Verify getOne was called to return the view entity
      expect(service.getOne).toHaveBeenCalledWith(req);
    });

    it('createMany should delegate to AttReport service', async () => {
      const req = { options: {}, parsed: {} } as any;
      const dto = { bulk: [] };

      await service.createMany(req, dto);

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(AttReport);
      expect(mockBaseCreateMany).toHaveBeenCalledWith(req, dto);
    });

    it('bulkEdit should update the att_report table through the shared bulk edit', async () => {
      service.handleBulkEditAction = jest.fn().mockResolvedValue('עודכנו 2 רשומות');
      const req = { parsed: { extra: { action: 'bulkEdit', ids: '1,2', absCount: '0' } } } as any;

      const result = await service.doAction(req, {});

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(AttReport);
      expect(service.handleBulkEditAction).toHaveBeenCalledWith(req, mockRepo);
      expect(result).toBe('עודכנו 2 רשומות');
    });

    it('bulkKnownAbsences should only use ids the caller can access', async () => {
      service.getManyByIds.mockResolvedValueOnce([{ id: 1 }]);
      mockRepo.findBy.mockResolvedValueOnce([]);
      const req = { parsed: { extra: { action: 'bulkKnownAbsences', ids: '1,99' } } } as any;

      // An empty insert fails validation; only the lookup matters here
      await service.doAction(req, {}).catch(() => undefined);

      expect(service.getManyByIds).toHaveBeenCalledWith(req, [1, 99]);
      expect(mockRepo.findBy.mock.calls[0][0].id.value).toEqual([1]);
    });

    it('bulkKnownAbsences should do nothing when no selected id is accessible', async () => {
      service.getManyByIds.mockResolvedValueOnce([]);
      const req = { parsed: { extra: { action: 'bulkKnownAbsences', ids: '99' } } } as any;

      const result = await service.doAction(req, {});

      expect(mockRepo.findBy).not.toHaveBeenCalled();
      expect(result).toBe('לא נבחרו רשומות');
    });
  });
});
