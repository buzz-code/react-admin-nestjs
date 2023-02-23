import { Chain, Handler, YemotRequest, YemotResponse } from "./interface";

class CheckIfTeacherDefinedHandler extends Handler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.teacher !== undefined) {
            // Exit the chain early if teacher is already defined
            return next(true);
        } else {
            return next();
        }
    }
}

class GetTeacherFromPhoneHandler {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        const teacher = await req.getTeacherByPhone(req.params.phone);
        if (teacher) {
            req.params.teacher = teacher;
            return next();
        } else {
            return res.send('teacherIsNotDefined');
        }
    }
}

// Create the chain with the appropriate handlers
export default new Chain([
    new CheckIfTeacherDefinedHandler(),
    new GetTeacherFromPhoneHandler(),
]);
