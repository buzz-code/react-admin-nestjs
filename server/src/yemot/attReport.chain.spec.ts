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
            chain.handlers.length = 4;
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

    describe('should load student list', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
            req.params.howManyLessons = 2;
            req.params.baseReport = {
                userId: req.params.userId,
                teacherReferenceId: 'teacher1',
                klassReferenceId: req.params.klass.data.id,
                lessonReferenceId: req.params.lesson.data.id,
                reportDate: new Date(),
            };
            chain.handlers.length = 5;
            next.mockClear();
        });

        it('should not load student list if already defined', async () => {
            // Arrange
            req.params.students = [{ tz: '111111111' }, { tz: '222222222' }];

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.params.students).toEqual([{ tz: '111111111' }, { tz: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });

        it('should load student list if not defined and idsToSkip is empty set', async () => {
            // Arrange
            req.params.students = undefined;
            req.params.idsToSkip = new Set();
            req.getStudentsByUserIdAndKlassIds = jest.fn().mockResolvedValue([{ tz: '111111111' }, { tz: '222222222' }]);

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.getStudentsByUserIdAndKlassIds).toHaveBeenCalledWith(req.params.userId, req.params.baseReport.klassReferenceId);
            expect(req.params.students).toEqual([{ tz: '111111111' }, { tz: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });

        it('should load student list if not defined and idsToSkip is filled set', async () => {
            // Arrange
            req.params.students = undefined;
            req.params.idsToSkip = new Set(['333333333']);
            req.getStudentsByUserIdAndKlassIds = jest.fn().mockResolvedValue([{ tz: '111111111' }, { tz: '222222222' }, { tz: '333333333' }]);

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.getStudentsByUserIdAndKlassIds).toHaveBeenCalledWith(req.params.userId, req.params.baseReport.klassReferenceId);
            expect(req.params.students).toEqual([{ tz: '111111111' }, { tz: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('should iterate students', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
            req.params.howManyLessons = 2;
            req.params.baseReport = {
                userId: req.params.userId,
                teacherReferenceId: 'teacher1',
                klassReferenceId: req.params.klass.data.id,
                lessonReferenceId: req.params.lesson.data.id,
                reportDate: new Date(),
            };
            req.params.students = [{ tz: '111111111' }, { tz: '222222222' }];
            chain.handlers.length = 6;
            req.saveReport = jest.fn();
            next.mockClear();
        });

        it('when there are more students to iterate, should set the current student and call the studentChain', async () => {
            await chain.handleRequest(req, res, next);

            expect(req.params.studentIndex).toBe(0);
            expect(req.params.student).toEqual(req.params.students[0]);
            expect(req.params.existing).toEqual([]);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('absCount');
        });

        it('when there are no more students to iterate, should call the next handler', async () => {
            req.params.studentIndex = 2;

            await chain.handleRequest(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it('when there is an absCount, should validate its value', async () => {
            req.params.absCount = 0;

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('absCount');
        });

        it('when there is a large absCount, should ask again', async () => {
            req.params.absCount = 3;

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('absCount');
        });

        it('when opened a side menu, should ask for direction', async () => {
            req.params.absCount = '*';

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('sideMenu');
        });

        it('when opened a side menu with a direction, should go to student', async () => {
            req.params.absCount = '*6';

            await chain.handleRequest(req, res, next);

            expect(req.params.studentIndex).toEqual(1);
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('absCount');
        });

        it('when there is a valid absCount, should save and go to next student', async () => {
            req.params.absCount = 1;
            req.params.studentIndex = 0;

            await chain.handleRequest(req, res, next);

            console.log(req.params)
            expect(req.params.studentIndex).toEqual(1);
            expect(req.saveReport).toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(0);
            expect(res.send).toHaveBeenCalledWith('absCount');
        });
    });
});
