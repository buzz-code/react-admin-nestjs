import { Test, TestingModule } from '@nestjs/testing';
import { AttReportsService } from './att_reports.service';

describe('AttReportsService', () => {
  let service: AttReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttReportsService],
    }).compile();

    service = module.get<AttReportsService>(AttReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
