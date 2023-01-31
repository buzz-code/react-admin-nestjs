import { YemotProccessor, YEMOT_HANGUP_STEP, YEMOT_NOT_IMPL_STEP } from "@shared/utils/yemot/yemot-call.module";
import { YemotCall, YemotParams } from "@shared/entities/YemotCall.entity";
import yemotUtil from "@shared/utils/yemot/yemot.util";

export class YemotProccessorImpl extends YemotProccessor {
    steps = {
        initial: 'initial',
        getTeacherId: 'got-teacher-id',
        [YEMOT_HANGUP_STEP]: YEMOT_HANGUP_STEP,
        [YEMOT_NOT_IMPL_STEP]: YEMOT_NOT_IMPL_STEP,
    };

    private async getText(textKey: string, ...args): Promise<string> {
        // use cache
        return 'text: ' + textKey;
    }

    async processCall(activeCall: YemotCall, body: YemotParams): Promise<{ response: string; nextStep: string; }> {
        switch (activeCall.currentStep) {
            case this.steps.initial: {
                return {
                    response: yemotUtil.send(
                        yemotUtil.id_list_message_v2(await this.getText('welcome')),
                        yemotUtil.read_v2(await this.getText('type teacher id'), 'teacherId', { min: 1, max: 9 })
                    ),
                    nextStep: this.steps.getTeacherId,
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