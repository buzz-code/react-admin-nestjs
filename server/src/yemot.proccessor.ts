import { YemotProccessor, YEMOT_HANGUP_STEP } from "./common/yemot-call.module";
import { YemotCall, YemotParams } from "./entities/YemotCall";
import yemotUtil from "./common/yemot.util";

export class YemotProccessorImpl extends YemotProccessor {
    steps = [
        YEMOT_HANGUP_STEP
    ];

    private async getText(textKey: string, ...args): Promise<string> {
        // use cache
        return 'text: ' + textKey;
    }

    async processCall(activeCall: YemotCall, body: YemotParams): Promise<{ response: string; nextStep: string; }> {
        switch (activeCall.currentStep) {
            case 'initial': {
                return {
                    response: yemotUtil.send(
                        yemotUtil.id_list_message_v2(await this.getText('welcome')),
                        yemotUtil.read_v2(await this.getText('type teacher id'), 'teacherId', { min: 1, max: 9 })
                    ),
                    nextStep: 'got-teacher-id'
                }
            }
            case 'got-teacher-id': {
                // const teacher = await this.teacherRepo.findOneBy({id: body.teacherId});
                return {
                    response: yemotUtil.send(
                        yemotUtil.read_v2('great ' + body.teacherId, 'nothing')
                    ),
                    nextStep: YEMOT_HANGUP_STEP,
                }
            }
            default: {
                return {
                    response: yemotUtil.send(
                        yemotUtil.hangup()
                    ),
                    nextStep: 'error-not-impl-step'
                }
            }
        }
    }
}