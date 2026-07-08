import config from '../att-report-with-report-month.config';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';

// Mock BaseEntityService
const mockBaseCreateOne = jest.fn().mockResolvedValue({ id: 1 });
const mockBaseCreateMany = jest.fn().mockResolvedValue([{ id: 1 }]);
const mockBaseConstructor = jest.fn();

jest.mock('@shared/base-entity/base-entity.service', () => {
  class MockBaseEntityService {
    dataSource: any;
    constructor(
      public repo: any,
      public mailSendService: any,
    ) {
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

      mockBaseCreateOne.mockClear();
      mockBaseCreateMany.mockClear();
      mockBaseConstructor.mockClear();
      (BaseEntityService as unknown as jest.Mock).mockClear?.();
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
  });

  describe('doAction - deleteOutsideKlass', () => {
    let service: any;
    let mockAttReportRepo: any;
    let mockStudentKlassRepo: any;

    beforeEach(() => {
      mockAttReportRepo = { findBy: jest.fn(), delete: jest.fn() };
      mockStudentKlassRepo = { findBy: jest.fn() };
      const mockDataSource = {
        getRepository: jest.fn((entity) => (entity === StudentKlass ? mockStudentKlassRepo : mockAttReportRepo)),
      };

      const ServiceClass = config.service as any;
      service = new ServiceClass(mockAttReportRepo, {});
      service.dataSource = mockDataSource;
    });

    const callAction = (extra: any) => service.doAction({ parsed: { extra: { action: 'deleteOutsideKlass', ...extra } } }, {});

    it('returns a message when no ids are selected', async () => {
      const result = await callAction({ klassReferenceId: '1', reportDate: '2024-05-01' });
      expect(result).toBe('לא נבחרו רשומות');
      expect(mockAttReportRepo.findBy).not.toHaveBeenCalled();
    });

    it('returns a message when no klass is chosen', async () => {
      const result = await callAction({ ids: '1,2', reportDate: '2024-05-01' });
      expect(result).toBe('לא נבחרה כיתה');
    });

    it('returns a message when no date is chosen', async () => {
      const result = await callAction({ ids: '1,2', klassReferenceId: '1' });
      expect(result).toBe('לא נבחר תאריך');
    });

    it('deletes reports only for students not linked to the chosen klass', async () => {
      mockAttReportRepo.findBy.mockResolvedValue([
        { id: 1, studentReferenceId: 101, year: 2024 },
        { id: 2, studentReferenceId: 102, year: 2024 },
        { id: 3, studentReferenceId: 103, year: 2024 },
      ]);
      mockStudentKlassRepo.findBy.mockResolvedValue([{ studentReferenceId: 101, year: 2024 }]);

      const result = await callAction({ ids: '1,2,3', klassReferenceId: '5', reportDate: '2024-05-01' });

      expect(mockAttReportRepo.delete).toHaveBeenCalledWith([2, 3]);
      expect(result).toBe('נמחקו 2 רשומות נוכחות עבור תלמידות שאינן משויכות לכיתה שנבחרה');
    });

    it('deletes nothing when every selected student is in the klass', async () => {
      mockAttReportRepo.findBy.mockResolvedValue([{ id: 1, studentReferenceId: 101, year: 2024 }]);
      mockStudentKlassRepo.findBy.mockResolvedValue([{ studentReferenceId: 101, year: 2024 }]);

      const result = await callAction({ ids: '1', klassReferenceId: '5', reportDate: '2024-05-01' });

      expect(mockAttReportRepo.delete).not.toHaveBeenCalled();
      expect(result).toBe('כל התלמידות שנבחרו משויכות לכיתה, לא נמחקה אף רשומה');
    });
  });
});
