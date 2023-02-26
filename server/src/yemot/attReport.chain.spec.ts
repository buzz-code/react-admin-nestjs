import getAttReportChain from "./attReport.chain";
import { YemotRequest, YemotResponse } from "./interface";

describe("attReport chain", () => {
    let req: YemotRequest;
    let res: YemotResponse;
    let next: jest.Mock<any, any>;
    let chain: ReturnType<typeof getAttReportChain>;
    const getExistingReports = jest.fn().mockResolvedValue([]);

    beforeEach(() => {
        req = {
            params: {
                userId: "user123",
                klass: { data: { id: "klass123" } },
                lesson: { data: { id: "lesson123" } },
                isCurrentMonth: "1",
            },
        } as YemotRequest;

        res = {
            send: jest.fn(),
        } as YemotResponse;

        next = jest.fn();

        chain = getAttReportChain(getExistingReports);
    });

    describe("GetSheetNameHandler", () => {
        beforeEach(() => {
            chain.handlers.length = 1;
        });

        it("should call next if sheetName is already defined", () => {
            req.params.sheetName = "someSheetName";

            chain.handleRequest(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();
            expect(req.params.sheetName).toEqual("someSheetName");
        });

        it("should ask if current month if isCurrentMonth is not defined", () => {
            req.params.isCurrentMonth = undefined;

            chain.handleRequest(req, res, next);

            expect(res.send).toHaveBeenCalledWith("askIsCurrentMonth");
            expect(next).not.toHaveBeenCalled();
        });

        it("should set sheetName to current month if isCurrentMonth is '1'", () => {
            chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(req.params.sheetName).toEqual(expect.any(String));
        });

        it("should ask for current month if isCurrentMonth is not '1'", () => {
            req.params.isCurrentMonth = "0";

            chain.handleRequest(req, res, next);

            expect(res.send).toHaveBeenCalledWith("askForCurrentMonth");
            expect(next).not.toHaveBeenCalled();
        });

        it("should set sheetName to requested month if currentMonth is defined", () => {
            req.params.currentMonth = "3";

            chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(req.params.sheetName).toEqual(expect.any(String));
        });
    });


    describe('GetExistingReportsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            chain.handlers.length = 2;
            getExistingReports.mockClear();
        });

        it('should call getExistingReports if existingReports param is not defined', async () => {
            await chain.handleRequest(req, res, next);

            expect(getExistingReports).toHaveBeenCalledWith(req.params.userId, req.params.klass.data.id, req.params.lesson.data.id, req.params.sheetName);
            expect(next).toHaveBeenCalled();
            expect(req.params.existingReports).toEqual(expect.any(Array));
        });

        it('should not call getExistingReports if existingReports param is already defined', async () => {
            req.params.existingReports = [];

            await chain.handleRequest(req, res, next);

            expect(getExistingReports).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('CheckExistingReportsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [{ student_tz: '123' }, { student_tz: '456' }];
            chain.handlers.length = 3;
        });

        it('should ask if skip existing reports if existingReports has items and isSkipExistingReports is not defined', async () => {
            await chain.handleRequest(req, res, next);

            expect(res.send).toHaveBeenCalledWith('askIfSkipExistingReports');
            expect(next).not.toHaveBeenCalled();
        });

        it('should not ask if skip existing reports if existingReports is empty', async () => {
            req.params.existingReports = [];

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should not ask if skip existing reports if isSkipExistingReports is already defined', async () => {
            req.params.isSkipExistingReports = true;

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should create idsToSkip set if isSkipExistingReports is "1"', async () => {
            req.params.isSkipExistingReports = '1';

            await chain.handleRequest(req, res, next);

            expect(req.params.idsToSkip).toEqual(new Set(['123', '456']));
            expect(next).toHaveBeenCalled();
        });

        it('should create an empty idsToSkip set if isSkipExistingReports is not "1"', async () => {
            req.params.isSkipExistingReports = '0';

            await chain.handleRequest(req, res, next);

            expect(req.params.idsToSkip).toEqual(new Set());
            expect(next).toHaveBeenCalled();
        });
    });

    describe('CheckHowManyLessonsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
        });

        it('should ask for how many lessons if howManyLessons param is not defined', async () => {
            await chain.handleRequest(req, res, next);

            expect(res.send).toHaveBeenCalledWith('howManyLessons');
            expect(next).not.toHaveBeenCalled();
        });

        it('should ask for how many lessons if howManyLessons param is "0"', async () => {
            req.params.howManyLessons = '0';

            await chain.handleRequest(req, res, next);

            expect(res.send).toHaveBeenCalledWith('howManyLessons');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if howManyLessons is defined', async () => {
            req.params.howManyLessons = '10';

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });
});
