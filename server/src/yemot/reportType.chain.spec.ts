import getAttReportChain from './attReport.chain';
import { YemotRequest, YemotResponse } from './interface';
import getReportTypeChain from './reportType.chain';
import gradeReportChain from './teacherByPhone.chain';

async function getExistingReports(userId: string, klassId: string, lessonId: string, sheetName: string) {
    return [];
}
const attReportChain = getAttReportChain(getExistingReports);
const reportTypeChain = getReportTypeChain(attReportChain);

describe('reportChain', () => {
    let req: YemotRequest;
    let res: YemotResponse;
    const sendMock = jest.fn();
    const next = jest.fn();
    beforeEach(() => {
        req = { params: {} } as YemotRequest;
        res = { send: sendMock } as YemotResponse;
        next.mockClear();
    });

    it('should return askForReportType if reportType is undefined', async () => {
        await reportTypeChain.handleRequest(req, res, next);
        expect(sendMock).toHaveBeenCalledWith('getReportType');
        expect(next).not.toHaveBeenCalled();
    });

    it('should use attReportChain if reportType is 1', async () => {
        req.params.reportType = '1';
        const attReportChainMock = jest.spyOn(attReportChain, 'handleRequest');
        await reportTypeChain.handleRequest(req, res, next);
        expect(attReportChainMock).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should use gradeReportChain if reportType is 2', async () => {
        req.params.reportType = '2';
        const gradeReportChainMock = jest.spyOn(gradeReportChain, 'handleRequest');
        await reportTypeChain.handleRequest(req, res, next);
        expect(gradeReportChainMock).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should go on if reportType is 3', async () => {
        req.params.reportType = '3';
        await reportTypeChain.handleRequest(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
