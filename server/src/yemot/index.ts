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
const klassFromLessonHandler = new Handler(async (req, res, callback) => {
    if (!req.params.teacher?.data) {
        if (req.params.lesson.data.klasses && !req.params.lesson.data.klasses.includes(',')) {
            req.params.teacher = {
                id: req.params.lesson.data.klasses
            };
        }
    }
    return callback();
});
const klassChain = getResourceConfirmationChain('klass', getKlassFromKlassId);


export default new Chain([
    teacherChain,
    lessonChain,
    klassFromLessonHandler,
    klassChain
]);
