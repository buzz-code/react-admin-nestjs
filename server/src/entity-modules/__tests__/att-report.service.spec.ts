import * as ExcelJS from 'exceljs';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CrudRequest } from '@dataui/crud';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { ENTITY_EXPORTER, ENTITY_REPOSITORY } from '@shared/base-entity/interface';
import * as reportUtil from '@shared/utils/report/report.util';
import * as attendanceSheetUtil from 'src/utils/attendanceSheet.util';
import attendanceSheetTemplate from 'src/reports/attendanceSheetTemplate';
import attReportConfig from '../att-report.config';

jest.mock('@shared/utils/report/report.util', () => ({
  generateCommonFileResponse: jest.fn().mockResolvedValue({ data: 'file' }),
}));
jest.mock('src/utils/attendanceSheet.util', () => ({
  parseAttendanceWorkbook: jest.fn().mockReturnValue({ sheets: [], errors: [] }),
  importAttendanceWorkbook: jest.fn().mockResolvedValue({ success: true }),
}));

describe('att-report service attendance sheet actions', () => {
  let service: any;
  const dataSource = {} as DataSource;

  beforeEach(async () => {
    jest.clearAllMocks();
    const repository = {
      metadata: { columns: [{ propertyName: 'id' }], relations: [], connection: { options: { type: 'mysql' } } },
      manager: { connection: { createQueryRunner: jest.fn() } },
    };
    const module = await Test.createTestingModule({
      providers: [
        attReportConfig.service,
        { provide: ENTITY_REPOSITORY, useValue: repository },
        { provide: ENTITY_EXPORTER, useValue: attReportConfig.exporter },
        { provide: MailSendService, useValue: { send: jest.fn() } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get(attReportConfig.service);
  });

  const makeReq = (extra: any, permissions: any = { attendanceSheetImport: true }) =>
    ({ parsed: { extra }, auth: { id: 7, permissions } } as unknown as CrudRequest);

  it('rejects users without the attendanceSheetImport permission', async () => {
    await expect(service.doAction(makeReq({ action: 'attendanceSheetTemplate' }, {}), {})).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.doAction(makeReq({ action: 'attendanceSheetImport' }, {}), {})).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('requires an admin to impersonate a user', async () => {
    await expect(service.doAction(makeReq({ action: 'attendanceSheetImport' }, { admin: true }), {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('generates the template for the selected klass and lessons', async () => {
    await service.doAction(makeReq({ action: 'attendanceSheetTemplate', klassId: '3', lessonIds: '4,5' }), {});
    expect(reportUtil.generateCommonFileResponse).toHaveBeenCalledWith(
      attendanceSheetTemplate,
      { userId: 7, klassId: 3, lessonIds: [4, 5] },
      dataSource,
    );
  });

  it('parses the uploaded workbook and imports it for the user', async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('א1').getCell('F2').value = 11;
    const fileData = Buffer.from(await workbook.xlsx.writeBuffer()).toString('base64');

    const result = await service.doAction(makeReq({ action: 'attendanceSheetImport' }), { fileData });

    expect(result).toEqual({ success: true });
    const parsedWorkbook = (attendanceSheetUtil.parseAttendanceWorkbook as jest.Mock).mock.calls[0][0];
    expect(parsedWorkbook.getWorksheet('א1').getCell('F2').value).toBe(11);
    expect(attendanceSheetUtil.importAttendanceWorkbook).toHaveBeenCalledWith(
      dataSource,
      7,
      { sheets: [], errors: [] },
      { dryRun: undefined },
    );
  });

  it('passes the dry run flag', async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('א1');
    const fileData = Buffer.from(await workbook.xlsx.writeBuffer()).toString('base64');

    await service.doAction(makeReq({ action: 'attendanceSheetImport', dryRun: 'true' }), { fileData });

    expect((attendanceSheetUtil.importAttendanceWorkbook as jest.Mock).mock.calls[0][3]).toEqual({ dryRun: true });
  });

  it('rejects a file that is not xlsx', async () => {
    await expect(
      service.doAction(makeReq({ action: 'attendanceSheetImport' }), { fileData: 'bm90IGFuIHhsc3g=' }),
    ).rejects.toThrow(BadRequestException);
  });
});
