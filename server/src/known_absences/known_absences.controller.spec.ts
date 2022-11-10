import { Test, TestingModule } from '@nestjs/testing';
import { KnownAbsencesController } from './known_absences.controller';
import { KnownAbsencesService } from './known_absences.service';

describe('KnownAbsencesController', () => {
  let controller: KnownAbsencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnownAbsencesController],
      providers: [KnownAbsencesService],
    }).compile();

    controller = module.get<KnownAbsencesController>(KnownAbsencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
