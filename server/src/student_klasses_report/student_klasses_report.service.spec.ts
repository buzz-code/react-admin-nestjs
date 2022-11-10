import { Test, TestingModule } from '@nestjs/testing';
import { StudentKlassesReportService } from './student_klasses_report.service';

describe('StudentKlassesReportService', () => {
  let service: StudentKlassesReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentKlassesReportService],
    }).compile();

    service = module.get<StudentKlassesReportService>(StudentKlassesReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
