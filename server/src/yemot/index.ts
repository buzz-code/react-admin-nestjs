import { Chain, Handler, YemotRequest } from "./interface";
import getResourceConfirmationChain from "./resourceWithConfirmation.chain";
import teacherByPhoneChain from "./teacherByPhone.chain";

const teacherChain = teacherByPhoneChain;


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


export default new Chain([
    teacherChain,
    lessonChain,
    klassFromLessonHandler,
    klassChain,
    createBaseReportHandler,
]);
