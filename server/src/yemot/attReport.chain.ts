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

// todo: add askForStudentData logic
export default function getAttReportChain(getExistingReports: GetExistingReportsFunction) {
    return new Chain([
        new GetSheetNameHandler(),
        new GetExistingReportsHandler(getExistingReports),
        new CheckExistingReportsHandler(),
        new CheckHowManyLessonsHandler(),
    ]);
}
