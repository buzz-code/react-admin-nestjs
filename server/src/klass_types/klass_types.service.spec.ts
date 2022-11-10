import { Test, TestingModule } from '@nestjs/testing';
import { KlassTypesService } from './klass_types.service';

describe('KlassTypesService', () => {
  let service: KlassTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KlassTypesService],
    }).compile();

    service = module.get<KlassTypesService>(KlassTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
