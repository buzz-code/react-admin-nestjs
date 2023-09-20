import getReportChain, { IReportProperty } from "./attReport.chain";
import { Chain, Handler } from "@shared/utils/yemot/chain.interface";
import getReportTypeChain from "./reportType.chain";
import getResourceConfirmationChain from "./resourceWithConfirmation.chain";
import teacherByPhoneChain from "./teacherByPhone.chain";
import { YemotRequest } from "@shared/utils/yemot/yemot.interface";


function getLessonFromLessonId(req: YemotRequest) {
    return req.getLessonFromLessonId(req.params.lessonId);
};
const lessonChain = getResourceConfirmationChain('lesson', getLessonFromLessonId);


const klassFromLessonHandler = new Handler(async (req, res, next) => {
    if (req.params.klass?.data === undefined) {
        if (req.params.lesson.data.klassReferenceIds?.length === 1) {
            const klass = await req.getKlassByKlassId(req.params.klassId, req.params.lesson.data.klassReferenceIds[0]);
            req.params.klass = {
                id: klass.key,
                data: klass,
            };
        }
    }
    return next();
});
function getKlassFromKlassId(req: YemotRequest) {
    return req.getKlassByKlassId(req.params.klassId);
};
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
    return next();
});


const notifySuccessAndEndHandler = new Handler(async (req, res, next) => {
    return res.send(res.getText('dataWasSavedSuccessfully'));
});


async function getExistingAttReports(req: YemotRequest, klassId: string, lessonId: string, sheetName: string) {
    return req.getExistingAttReports(klassId, lessonId, sheetName);
}
const attProperties: IReportProperty[] = [
    {
        name: 'absCount',
        message: 'absCount',
        field: 'abs_count',
        validate(req: YemotRequest) {
            return req.params.absCount > 0 && req.params.absCount <= req.params.howManyLessons;
        }
    }
]
const attReportChain = getReportChain(getExistingAttReports, attProperties);
async function getExistingGradeReports(req: YemotRequest, klassId: string, lessonId: string, sheetName: string) {
    return req.getExistingGradeReports(klassId, lessonId, sheetName);
}
const gradeProperties: IReportProperty[] = [
    {
        name: 'grade',
        message: 'grade',
        field: 'grade',
        validate(req: YemotRequest) {
            return req.params.grade > 0 && req.params.grade <= 100;
        }
    }
]
const gradeReportChain = getReportChain(getExistingGradeReports, gradeProperties);

const reportTypeChain = getReportTypeChain(attReportChain, gradeReportChain);


// todo: add exeption handler and res.send('dataWasNotSaved');
export default new Chain('yemot chain', [
    teacherByPhoneChain,
    lessonChain,
    klassFromLessonHandler,
    klassChain,
    createBaseReportHandler,
    reportTypeChain,
    notifySuccessAndEndHandler,
]);
