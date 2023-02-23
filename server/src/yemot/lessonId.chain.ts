import { Chain } from "./interface";

class CheckIfLessonDefinedHandler {
    handleRequest(req, res, next) {
        if (req.lesson !== undefined) {
            // Exit the chain early if lesson is already defined
            next(true);
        } else {
            next();
        }
    }
}

class AskForLessonIdHandler {
    handleRequest(req, res, next) {
        if (!req.has('lessonId')) {
            delete req.lessonToConfirm;
            return res.askForLessonId();
        }
        next();
    }
}

class GetLessonFromLessonIdHandler {
    handleRequest(req, res, next) {
        if (!req.has('lessonToConfirm')) {
            const lesson = req.getLessonFromLessonId(req.lessonId);
            req.lessonToConfirm = lesson;
        }
        next();
    }
}

class AskForLessonConfirmHandler {
    handleRequest(req, res, next) {
        if (!req.has('lessonConfirm')) {
            if (req.lessonToConfirm != null) {
                delete req.lesson;
                return res.askForLessonConfirm();
            } else {
                // If lesson is null, ask for lesson ID again
                delete req.lessonId;
                return res.askForLessonId();
            }
        }
        next();
    }
}

class ConfirmLessonHandler {
    handleRequest(req, res, next) {
        if (req.lessonConfirm === true) {
            // Set the lesson and exit the chain if confirmed
            req.lesson = req.lessonToConfirm;
            next();
        } else {
            // If not confirmed, ask for lesson ID again
            delete req.lessonId;
            delete req.lessonToConfirm;
            delete req.lessonConfirm;
            return res.askForLessonId();
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
