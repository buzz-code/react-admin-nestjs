import { Test, TestingModule } from '@nestjs/testing';
import { StudentKlassesService } from './student_klasses.service';

describe('StudentKlassesService', () => {
  let service: StudentKlassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentKlassesService],
    }).compile();

    service = module.get<StudentKlassesService>(StudentKlassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
