import getAttReportChain, { IReportProperty } from "./attReport.chain";
import { Chain, Handler, YemotRequest } from "./interface";
import getReportTypeChain from "./reportType.chain";
import getResourceConfirmationChain from "./resourceWithConfirmation.chain";
import teacherByPhoneChain from "./teacherByPhone.chain";


function getLessonFromLessonId(req: YemotRequest) {
    return req.dataSource.getLessonFromLessonId(req.params.lesson.id);
};
const lessonChain = getResourceConfirmationChain('lesson', getLessonFromLessonId);


function getKlassFromKlassId(req: YemotRequest) {
    return req.dataSource.getLessonFromLessonId(req.params.klass.id);
};
const klassFromLessonHandler = new Handler(async (req, res, next) => {
    if (req.params.teacher?.data === undefined) {
        if (req.params.lesson.data.klasses && !req.params.lesson.data.klasses.includes(',')) {
            req.params.teacher = {
                id: req.params.lesson.data.klasses
            };
        }
    }
    return next();
});
const klassChain = getResourceConfirmationChain('klass', getKlassFromKlassId);


const createBaseReportHandler = new Handler(async (req, res, next) => {
    if (req.params.baseReport === undefined) {
        req.params.baseReport = {
            userId: req.params.userId,
            teacherReferenceId: req.params.teacher.id,
            klassReferenceId: req.params.klass.data.id,
            lessonReferenceId: req.params.lesson.data.id,
            reportDate: new Date(),
        };
    }
    next();
});


const notifySuccessAndEndHandler = new Handler(async (req, res, next) => {
    return res.send('dataWasSavedSuccessfully');
});


async function getExistingReports(userId: string, klassId: string, lessonId: string, sheetName: string) {
    return [];
}
const properties: IReportProperty[] = [
    {
        name: 'absCount',
        message: 'absCount',
        field: 'abs_count',
        validate(req: YemotRequest) {
            return req.params.absCount > 0 && req.params.absCount <= req.params.howManyLessons;
        }
    }
]
const attReportChain = getAttReportChain(getExistingReports, properties);


// todo: create gradeReportChain
const reportTypeChain = getReportTypeChain(attReportChain);


// todo: add exeption handler and res.send('dataWasNotSaved');
export default new Chain([
    teacherByPhoneChain,
    lessonChain,
    klassFromLessonHandler,
    klassChain,
    createBaseReportHandler,
    reportTypeChain,
    notifySuccessAndEndHandler,
]);
