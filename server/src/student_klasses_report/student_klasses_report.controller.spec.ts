import { Test, TestingModule } from '@nestjs/testing';
import { StudentKlassesReportController } from './student_klasses_report.controller';
import { StudentKlassesReportService } from './student_klasses_report.service';

describe('StudentKlassesReportController', () => {
  let controller: StudentKlassesReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentKlassesReportController],
      providers: [StudentKlassesReportService],
    }).compile();

    controller = module.get<StudentKlassesReportController>(StudentKlassesReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
