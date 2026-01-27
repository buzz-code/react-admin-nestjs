import config from '../att-report-with-report-month.config';
import { AttReportWithReportMonth } from 'src/db/view-entities/AttReportWithReportMonth.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { AttReport } from 'src/db/entities/AttReport.entity';

// Mock BaseEntityService
const mockBaseCreateOne = jest.fn().mockResolvedValue({ id: 1 });
const mockBaseCreateMany = jest.fn().mockResolvedValue([{ id: 1 }]);
const mockBaseConstructor = jest.fn();

jest.mock('@shared/base-entity/base-entity.service', () => {
    class MockBaseEntityService {
        dataSource: any;
        constructor(public repo: any, public mailSendService: any) {
            mockBaseConstructor(repo, mailSendService);
        }
        async createOne(req: any, dto: any) { return mockBaseCreateOne(req, dto); }
        async createMany(req: any, dto: any) { return mockBaseCreateMany(req, dto); }
        async updateOne(req: any, dto: any) { return { id: 1 }; }
        async deleteOne(req: any) { return { id: 1 }; }
        async getOne(req: any) { return { id: 1 }; }
        async doAction(req: any, body: any) { return 'success'; }
    }
    return {
        BaseEntityService: MockBaseEntityService
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
                reportGroupSession: { eager: false }
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
});
