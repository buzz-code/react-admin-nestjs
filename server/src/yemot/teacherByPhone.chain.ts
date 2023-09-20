import { Chain, HandlerBase } from "@shared/utils/yemot/chain.interface";
import { YemotRequest, YemotResponse } from "@shared/utils/yemot/yemot.interface";

class CheckIfTeacherDefinedHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        console.log('tempp req.params.teacher', req.params.teacher)
        if (req.params.teacher !== undefined) {
            // Exit the chain early if teacher is already defined
            return next(true);
        } else {
            return next();
        }
    }
}

class GetTeacherFromPhoneHandler extends HandlerBase {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        const teacher = await req.getTeacherByPhone(req.params.ApiPhone);
        console.log('tempp GetTeacherFromPhoneHandler', teacher)
        if (teacher) {
            req.params.teacher = teacher;
            res.send(res.getText('welcomeForTeacher', teacher.name)) 
            return next();
        } else {
            res.send(res.getText('phoneIsNotRecognizedInTheSystem'));
            res.send(res.hangup());
        }
    }
}

// Create the chain with the appropriate handlers
export default new Chain([
    new CheckIfTeacherDefinedHandler(),
    new GetTeacherFromPhoneHandler(),
]);
