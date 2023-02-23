import { Chain } from "./interface";
import getResourceConfirmationChain from "./resourceWithConfirmation.chain";
import teacherByPhoneChain from "./teacherByPhone.chain";

const teacherChain = teacherByPhoneChain;

const lessonChain = getResourceConfirmationChain('lesson', req => req.dataSource.getLessonFromLessonId(req.params.lesson.id));

export default new Chain([teacherChain, lessonChain]);
