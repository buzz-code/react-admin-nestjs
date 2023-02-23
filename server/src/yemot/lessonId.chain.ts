import { Chain, Handler, YemotRequest, YemotResponse } from "./interface";

class CheckIfLessonDefinedHandler extends Handler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.lesson !== undefined) {
            // Exit the chain early if lesson is already defined
            next(true);
        } else {
            next();
        }
    }
}

class AskForLessonIdHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (!req.has('lessonId')) {
            delete req.params.lessonToConfirm;
            return res.send('askForLessonId');
        }
        next();
    }
}

class GetLessonFromLessonIdHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (!req.has('lessonToConfirm')) {
            const lesson = req.getLessonFromLessonId(req.params.lessonId);
            req.params.lessonToConfirm = lesson;
        }
        next();
    }
}

class AskForLessonConfirmHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (!req.has('lessonConfirm')) {
            if (req.params.lessonToConfirm != null) {
                delete req.params.lesson;
                return res.send('askForLessonConfirm');
            } else {
                // If lesson is null, ask for lesson ID again
                delete req.params.lessonId;
                return res.send('askForLessonId');
            }
        }
        next();
    }
}

class ConfirmLessonHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.lessonConfirm === true) {
            // Set the lesson and exit the chain if confirmed
            req.params.lesson = req.params.lessonToConfirm;
            next();
        } else {
            // If not confirmed, ask for lesson ID again
            delete req.params.lessonId;
            delete req.params.lessonToConfirm;
            delete req.params.lessonConfirm;
            return res.send('askForLessonId');
        }
    }
}

// Create the chain with the appropriate handlers
export default new Chain([
    new CheckIfLessonDefinedHandler(),
    new AskForLessonIdHandler(),
    new GetLessonFromLessonIdHandler(),
    new AskForLessonConfirmHandler(),
    new ConfirmLessonHandler(),
]);
