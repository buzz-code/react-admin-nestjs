import { Test, TestingModule } from '@nestjs/testing';
import { StudentKlassesController } from './student_klasses.controller';
import { StudentKlassesService } from './student_klasses.service';

describe('StudentKlassesController', () => {
  let controller: StudentKlassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentKlassesController],
      providers: [StudentKlassesService],
    }).compile();

    controller = module.get<StudentKlassesController>(StudentKlassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
