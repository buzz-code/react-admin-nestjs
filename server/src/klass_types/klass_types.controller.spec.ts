import { Test, TestingModule } from '@nestjs/testing';
import { KlassTypesController } from './klass_types.controller';
import { KlassTypesService } from './klass_types.service';

describe('KlassTypesController', () => {
  let controller: KlassTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KlassTypesController],
      providers: [KlassTypesService],
    }).compile();

    controller = module.get<KlassTypesController>(KlassTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
