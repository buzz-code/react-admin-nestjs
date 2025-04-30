import { User } from "@shared/entities/User.entity";
import { YemotCall } from "@shared/entities/YemotCall.entity";
import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { getMockDataSource, MockYemotRequest } from "@shared/utils/yemot/__tests__/yemot.interface.spec";
import { YemotRequest } from "@shared/utils/yemot/yemot.interface";
import { AttReport } from "src/db/entities/AttReport.entity";
import { Grade } from "src/db/entities/Grade.entity";
import { DataSource, In } from "typeorm";
import { YemotRequestImpl } from "../yemot.request.impl";

describe('YemotRequest', () => {
  let dataSource: DataSource;
  let yemotRequest: YemotRequestImpl;
  let activeCall: YemotCall;

  beforeEach(() => {
    dataSource = getMockDataSource();
    activeCall = new YemotCall();
    activeCall.userId = 1;
    yemotRequest = new YemotRequestImpl(activeCall, dataSource);
  });

  it('should return the correct userId from the active call', () => {
    const result = yemotRequest.getUserId();
    expect(result).toBe(1);
  });

  it('should return user permissions for the given userId', async () => {
    const user = { id: 1, permissions: ["READ", "WRITE"] };

    // Mock the database call
    jest.spyOn(yemotRequest, 'getUser').mockResolvedValue(user as User);

    const result = await yemotRequest.getUserPermissions();
    expect(result).toEqual(["READ", "WRITE"]);
  });

  it('should get lesson by lesson id', async () => {
    const lessonId = 1;
    const lesson = { id: 1 };

    jest.spyOn(dataSource.getRepository(YemotCall), 'findOneBy').mockResolvedValue(lesson as YemotCall);

    const result = await yemotRequest.getLessonFromLessonId(lessonId);
    expect(result).toEqual(lesson);
  });

  it('should get klass by klass id', async () => {
    const klassId = 1;
    const klass = { id: 1 };

    const mock = jest.spyOn(dataSource.getRepository(YemotCall), 'findOneBy').mockResolvedValue(klass as YemotCall);

    const result = await yemotRequest.getKlassByKlassId(null, klassId);
    expect(result).toEqual(klass);
    expect(mock).toHaveBeenCalledWith({ id: klassId });
  });

  it('should get klass by key', async () => {
    const klassKey = 1;
    const klass = { id: 1 };

    const mock = jest.spyOn(dataSource.getRepository(YemotCall), 'findOneBy').mockResolvedValue(klass as YemotCall);

    const result = await yemotRequest.getKlassByKlassId(klassKey, null);
    expect(result).toEqual(klass);
    expect(mock).toHaveBeenCalledWith({ key: klassKey, userId: 1, year: getCurrentHebrewYear() });
  });

  it('should get teacher by phone', async () => {
    const phone = '1234567890';
    const teacher = { id: 1 };

    jest.spyOn(dataSource.getRepository(YemotCall), 'findOne').mockResolvedValue(teacher as YemotCall);

    const result = await yemotRequest.getTeacherByPhone(phone);
    expect(result).toEqual(teacher);
  });

  it('should get students by klass id', async () => {
    const klassId = 1;
    const students = [{ id: 1 }, { id: 2 }];

    jest.spyOn(dataSource.getRepository(YemotCall), 'find').mockResolvedValue(students.map(student => ({ student })) as any[] as YemotCall[]);

    const result = await yemotRequest.getStudentsByKlassId(klassId);
    expect(result).toEqual(students);
  });

  it('should save report', async () => {
    const reportData = { id: 1 };
    const type = 'att';

    jest.spyOn(yemotRequest, 'getExistingAttReports').mockResolvedValue([]);
    jest.spyOn(yemotRequest, 'getExistingGradeReports').mockResolvedValue([]);
    jest.spyOn(dataSource.getRepository(AttReport), 'create').mockResolvedValue(reportData as never);

    const result = await yemotRequest.saveReport(reportData as AttReport, type);
    expect(result).toEqual(reportData);

    expect(dataSource.getRepository).toHaveBeenCalledWith(AttReport);
  });

  it('should get existing att reports', async () => {
    jest.spyOn(dataSource.getRepository(AttReport), 'findBy').mockResolvedValue([]);

    const result = await yemotRequest.getExistingAttReports(null, null, null);
    expect(result).toEqual([]);
  });

  it('should get existing grade reports', async () => {
    jest.spyOn(dataSource.getRepository(Grade), 'findBy').mockResolvedValue([]);

    const result = await yemotRequest.getExistingGradeReports(null, null, null);
    expect(result).toEqual([]);
  });

  it('should delete existing reports', async () => {
    const existingReports = [{ id: 1 }, { id: 2 }];

    const attMock = jest.spyOn(dataSource.getRepository(AttReport), 'delete').mockResolvedValue(null);
    const gradeMock = jest.spyOn(dataSource.getRepository(Grade), 'delete').mockResolvedValue(null);

    const result = await yemotRequest.deleteExistingReports(existingReports as (AttReport | Grade)[], 'att');
    expect(result).toEqual(undefined);
    expect(attMock).toHaveBeenCalledWith({ id: In([1, 2]) });

    const result2 = await yemotRequest.deleteExistingReports(existingReports as (AttReport | Grade)[], 'grade');
    expect(result2).toEqual(undefined);
    expect(gradeMock).toHaveBeenCalledWith({ id: In([1, 2]) });
  });
});

