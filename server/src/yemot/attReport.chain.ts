import { Chain, HandlerBase, YemotRequest, YemotResponse } from "./interface";

type GetExistingReportsFunction = (userId: string, klassId: string, lessonId: string, sheetName: string) => Promise<any>;

class GetSheetNameHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.sheetName !== undefined) {
            return next();
        } else if (req.params.isCurrentMonth === undefined) {
            return res.send('askIsCurrentMonth');
        } else if (req.params.isCurrentMonth === '1') {
            req.params.sheetName = this.getMonthName(new Date().getMonth() + 1);
            return next();
        } else if (req.params.currentMonth === undefined) {
            return res.send('askForCurrentMonth');
        } else {
            req.params.sheetName = this.getMonthName(Number(req.params.currentMonth));
            return next();
        }
    }

    getMonthName(number: number) {
        const date = new Date(2009, number - 1, 1);  // 2009-11-10
        const month = date.toLocaleString('he', { month: 'long' });
        return month;
    }
}

class GetExistingReportsHandler extends HandlerBase {
    constructor(private getExistingReports: GetExistingReportsFunction) {
        super();
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.existingReports === undefined) {
            req.params.existingReports = await this.getExistingReports(req.params.userId, req.params.klass.data.id, req.params.lesson.data.id, req.params.sheetName);
        }
        return next();
    }
}

class CheckExistingReportsHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.existingReports.length > 0) {
            if (req.params.isSkipExistingReports === undefined) {
                return res.send('askIfSkipExistingReports');
            } else if (req.params.idsToSkip === undefined) {
                if (req.params.isSkipExistingReports === '1') {
                    req.params.idsToSkip = new Set(req.params.existingReports.map(item => item.student_tz));
                } else {
                    req.params.idsToSkip = new Set();
                }
            }
        }
        return next();
    }
}

class CheckHowManyLessonsHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.howManyLessons === undefined) {
            return res.send('howManyLessons');
        } else if (req.params.howManyLessons === '0') {
            return res.send('howManyLessons');
        }
        return next();
    }
}

class LoadStudentListHandler extends HandlerBase {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.students === undefined) {
            const studentList = await req.getStudentsByUserIdAndKlassIds(req.params.userId, req.params.baseReport.klassReferenceId);
            req.params.students = studentList.filter(item => !req.params.idsToSkip.has(item.tz));
        }
        return next();
    }
}

class ValidateAbsCountHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.absCount === undefined) {
            return res.send('absCount');
        } else if (!req.params.absCountValidated) {
            if (this.isSideMenu(req.params.absCount, req, res)) {
                return next();
            }
            req.params.absCountValidated = req.params.absCount > 0 && req.params.absCount <= req.params.howManyLessons;
            if (!req.params.absCountValidated) {
                return res.send('absCount');
            }
        }
        return next();
    }

    isSideMenu(value: string, req: YemotRequest, res: YemotResponse) {
        if (req.params.sideMenu !== undefined) {
            value = '*' + req.params.sideMenu;
            req.params.sideMenu = undefined;
        }
        if (value === '*') {
            return res.send('sideMenu');
        } else if (value === '*4') {
            req.params.studentIndex--;
            req.params.studentIndex = Math.max(0, req.params.studentIndex);
        } else if (value === '*6') {
            req.params.studentIndex++;
        }
        return false;
    }
}
class SaveAndGoToNextStudent extends HandlerBase {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.existing.length) {
            await req.deleteExistingReports(req.params.existingReports);
        }
        const attReport = {
            ...req.params.baseReport,
            how_many_lessons: req.params.howManyLessons,
            student_tz: req.params.student.tz,
            abs_count: req.params.absCount,
            approved_abs_count: req.params.approvedAbsCount || '0',
            comments: '',
            sheet_name: req.params.sheetName,
        };
        await req.saveReport(attReport);

        req.params.studentIndex++;
        delete req.params.student;
        delete req.params.absCount;
        delete req.params.absCountValidated;
        return next();
    }
}
const studentChain = new Chain([
    new ValidateAbsCountHandler(),
    new SaveAndGoToNextStudent(),
]);

class IterateStudentsHandler extends HandlerBase {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.studentIndex === undefined) {
            req.params.studentIndex = 0;
        }
        if (req.params.studentIndex < req.params.students.length) {
            req.params.student = req.params.students[req.params.studentIndex];
            req.params.existing = req.params.existingReports.filter(item => item.student_tz == req.params.student.tz);
            return studentChain.handleRequest(req, res, () => {
                return this.handleRequest(req, res, next);
            });
        }
        return next();
    }
}


// todo: add askForStudentData logic
export default function getAttReportChain(getExistingReports: GetExistingReportsFunction) {
    return new Chain([
        new GetSheetNameHandler(),
        new GetExistingReportsHandler(getExistingReports),
        new CheckExistingReportsHandler(),
        new CheckHowManyLessonsHandler(),
        new LoadStudentListHandler(),
        new IterateStudentsHandler(),
    ]);
}
