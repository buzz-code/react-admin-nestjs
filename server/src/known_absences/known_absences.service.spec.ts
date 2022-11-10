import { Test, TestingModule } from '@nestjs/testing';
import { KnownAbsencesService } from './known_absences.service';

describe('KnownAbsencesService', () => {
  let service: KnownAbsencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnownAbsencesService],
    }).compile();

    service = module.get<KnownAbsencesService>(KnownAbsencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
