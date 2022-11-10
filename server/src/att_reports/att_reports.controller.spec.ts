import { Test, TestingModule } from '@nestjs/testing';
import { AttReportsController } from './att_reports.controller';
import { AttReportsService } from './att_reports.service';

describe('AttReportsController', () => {
  let controller: AttReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttReportsController],
      providers: [AttReportsService],
    }).compile();

    controller = module.get<AttReportsController>(AttReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
