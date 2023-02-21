import { YemotProcessor, YemotProcessorProvider, YEMOT_HANGUP_STEP, YEMOT_NOT_IMPL_STEP } from "@shared/utils/yemot/yemot.interface";
import { YemotCall, YemotParams } from "@shared/entities/YemotCall.entity";
import yemotUtil from "@shared/utils/yemot/yemot.util";
import { Teacher } from "./db/entities/Teacher.entity";

export const yemotProcessorProvider: YemotProcessorProvider = (dataSource) => new YemotProcessorImpl(dataSource);

class YemotProcessorImpl extends YemotProcessor {
    steps = {
        initial: 'initial',
        getTeacherId: 'got-teacher-id',
        [YEMOT_HANGUP_STEP]: YEMOT_HANGUP_STEP,
        [YEMOT_NOT_IMPL_STEP]: YEMOT_NOT_IMPL_STEP,
    };

    async processCall(activeCall: YemotCall, body: YemotParams): Promise<{ response: string; nextStep: string; }> {
        switch (activeCall.currentStep) {
            case this.steps.initial: {
                try {
                    const teacher = await this.dataSource.getRepository(Teacher).findOneByOrFail([{ phone: activeCall.phone }, { phone2: activeCall.phone }]);
                    return {
                        response: yemotUtil.send(
                            yemotUtil.id_list_message_v2(await this.getText('welcome')),
                            yemotUtil.read_v2(await this.getText('type teacher id', teacher.name), 'teacherId', { min: 1, max: 9 })
                        ),
                        nextStep: this.steps.getTeacherId,
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
            case this.steps.getTeacherId: {
                // const teacher = await this.teacherRepo.findOneBy({id: body.teacherId});
                return {
                    response: yemotUtil.send(
                        yemotUtil.read_v2('great ' + body.teacherId, 'nothing')
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