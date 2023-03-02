import { Chain, HandlerBase, YemotRequest, YemotResponse } from "@shared/utils/yemot/chain.interface";

class CheckIfTeacherDefinedHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
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
        const teacher = await req.getTeacherByPhone(req.params.phone);
        if (teacher) {
            req.params.teacher = teacher;
            return next();
        } else {
            return res.send('phoneIsNotRecognizedInTheSystem');
        }
    }
}

// Create the chain with the appropriate handlers
export default new Chain([
    new CheckIfTeacherDefinedHandler(),
    new GetTeacherFromPhoneHandler(),
]);
