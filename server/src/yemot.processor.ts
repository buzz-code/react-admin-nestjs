import { YemotProcessor, YemotProcessorProvider, YEMOT_HANGUP_STEP, YEMOT_NOT_IMPL_STEP } from "@shared/utils/yemot/yemot.interface";
import { YemotCall, YemotParams } from "@shared/entities/YemotCall.entity";
import yemotUtil from "@shared/utils/yemot/yemot.util";
import { Teacher } from "./db/entities/Teacher.entity";
import { Lesson } from "./db/entities/Lesson.entity";

export const yemotProcessorProvider: YemotProcessorProvider = (dataSource) => new YemotProcessorImpl(dataSource);

class YemotProcessorImpl extends YemotProcessor {
    steps = {
        initial: 'initial',
        getLessonId: 'got-lesson-id',
        [YEMOT_HANGUP_STEP]: YEMOT_HANGUP_STEP,
        [YEMOT_NOT_IMPL_STEP]: YEMOT_NOT_IMPL_STEP,
    };
    params = {
        lessonId: 'lessonId'
    }

    async processCall(activeCall: YemotCall, body: YemotParams): Promise<{ response: string; nextStep: string; }> {
        switch (activeCall.currentStep) {
            case this.steps.initial: {
                try {
                    const teacher = await this.dataSource.getRepository(Teacher).findOneByOrFail([
                        { phone: activeCall.phone },
                        { phone2: activeCall.phone }
                    ]);
                    return {
                        response: yemotUtil.send(
                            yemotUtil.id_list_message_v2(await this.getText('welcome')),
                            yemotUtil.read_v2(await this.getText('type lesson id', teacher.name), this.params.lessonId, { min: 1, max: 9 })
                        ),
                        nextStep: this.steps.getLessonId,
                    }
                } catch (e) {
                    console.log(e)
                    return {
                        response: yemotUtil.send(
                            yemotUtil.id_list_message_v2(await this.getText('no teacher found')),
                        ),
                        nextStep: this.steps[YEMOT_HANGUP_STEP],
                    }
                }
            }
            case this.steps.getLessonId: {
                const lesson = await this.dataSource.getRepository(Lesson).findOneByOrFail({
                    userId: activeCall.userId,
                    key: Number(body[this.params.lessonId])
                });
                return {
                    response: yemotUtil.send(
                        yemotUtil.read_v2(await this.getText('great ', body[this.params.lessonId], lesson.name), 'nothing')
                    ),
                    nextStep: this.steps[YEMOT_HANGUP_STEP],
                }
            }
            default: {
                return {
                    response: yemotUtil.send(
                        yemotUtil.hangup()
                    ),
                    nextStep: this.steps[YEMOT_NOT_IMPL_STEP],
                }
            }
        }
    }
}