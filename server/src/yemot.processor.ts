import { YemotProcessor, YemotProcessorProvider, YEMOT_HANGUP_STEP, YEMOT_NOT_IMPL_STEP } from "@shared/utils/yemot/yemot.interface";
import { YemotCall, YemotParams } from "@shared/entities/YemotCall.entity";
import yemotUtil from "@shared/utils/yemot/yemot.util";
import { Teacher } from "./db/entities/Teacher.entity";
import { Lesson } from "./db/entities/Lesson.entity";

export const yemotProcessorProvider: YemotProcessorProvider = (dataSource) => new YemotProcessorImpl(dataSource);

class YemotProcessorImpl extends YemotProcessor {
    steps = {
        initial: 'initial',
        gotLessonId: 'got-lesson-id',
        [YEMOT_HANGUP_STEP]: YEMOT_HANGUP_STEP,
        [YEMOT_NOT_IMPL_STEP]: YEMOT_NOT_IMPL_STEP,
    };
    params = {
        lessonId: 'lessonId',
        lessonConfirm: 'lessonConfirm',
    }

    async processCall(activeCall: YemotCall, body: YemotParams): Promise<{ response: string; nextStep: string; }> {
        switch (activeCall.currentStep) {
            case this.steps.initial: {
                const teacher = await this.helpers.getTeacherByPhone(activeCall);
                if (!teacher) {
                    return this.responses.teacherNotFound(activeCall);
                }

                activeCall.data.teacher = teacher;
                return this.responses.getLesson(activeCall);
            }
            case this.steps.gotLessonId: {
                const lesson = await this.helpers.getLesson(activeCall, Number(body[this.params.lessonId]));
                if (!lesson) {
                    return this.responses.retryGetLesson(activeCall);
                }

                activeCall.data.lesson = lesson;
                return this.responses.sendLessonName(activeCall);
            }
            default: {
                return this.responses.hangup(activeCall);
            }
        }

    }

    helpers = {
        getTeacherByPhone: (activeCall: YemotCall) => {
            return this.dataSource.getRepository(Teacher).findOneBy([
                { userId: activeCall.userId, phone: activeCall.phone },
                { userId: activeCall.userId, phone2: activeCall.phone }
            ]);
        },
        getLesson: (activeCall: YemotCall, lessonId: number) => {
            return this.dataSource.getRepository(Lesson).findOneBy({
                userId: activeCall.userId,
                key: lessonId
            });
        }
    }

    responses = {
        teacherNotFound: async (activeCall: YemotCall) => ({
            response: yemotUtil.send(
                yemotUtil.id_list_message_v2(await this.getText(activeCall.userId, 'phoneIsNotRecognizedInTheSystem')),
            ),
            nextStep: this.steps[YEMOT_HANGUP_STEP],
        }),
        getLesson: async (activeCall: YemotCall) => ({
            response: yemotUtil.send(
                yemotUtil.read_v2(await this.getText(activeCall.userId, 'typeLessonId', activeCall.data.teacher.name), this.params.lessonId, { max: 9, min: 1, block_asterisk: true })
            ),
            nextStep: this.steps.gotLessonId,
        }),
        retryGetLesson: async (activeCall: YemotCall) => ({
            response: yemotUtil.send(
                yemotUtil.id_list_message_v2(await this.getText(activeCall.userId, 'lessonIdNotFound')),
                yemotUtil.read_v2(await this.getText(activeCall.userId, 'tryAgain'), this.params.lessonId, { max: 9, min: 1, block_asterisk: true })
            ),
            nextStep: this.steps.gotLessonId,
        }),
        sendLessonName: async (activeCall: YemotCall) => ({
            response: yemotUtil.send(
                yemotUtil.read_v2(await this.getText(activeCall.userId, 'confirmLesson', activeCall.data.lesson.name), this.params.lessonConfirm, { max: 1, min: 1, block_asterisk: true })
            ),
            nextStep: this.steps[YEMOT_HANGUP_STEP],
        }),
        hangup: async (activeCall: YemotCall) => ({
            response: yemotUtil.send(
                yemotUtil.hangup()
            ),
            nextStep: this.steps[YEMOT_NOT_IMPL_STEP],
        }),
    }
}