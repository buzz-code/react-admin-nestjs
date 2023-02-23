import chain from './lessonId.chain';

describe('lesson chain of responsibility', () => {
    let req;
    let res;
    const defaultLesson = {
        id: 'history101',
        name: 'History 101'
    };

    beforeEach(() => {
        // Reset req and res objects before each test
        req = {
            lessonId: undefined,
            lesson: undefined,
            lessonToConfirm: undefined,
            lessonConfirm: undefined,
            getLessonFromLessonId: jest.fn().mockReturnValueOnce(defaultLesson),
            has: jest.fn((prop) => req[prop] !== undefined),
        };
        res = {
            askForLessonId: jest.fn(),
            askForLessonConfirm: jest.fn().mockImplementationOnce(() => {
                req.lessonConfirm = true;
            })
        };
    });

    test('lesson is confirmed, should set lesson and exit chain', () => {
        req.lessonId = defaultLesson.id;
        req.lessonToConfirm = defaultLesson;
        req.lessonConfirm = true;
        const next = jest.fn();

        chain.handleRequest(req, res, next);

        delete req.has;
        expect(next).toHaveBeenCalled();
        expect(req.lesson).toEqual(defaultLesson);
    });

    test('lesson ID is not defined, should ask for lesson ID', () => {
        const next = jest.fn();

        chain.handleRequest(req, res, next);

        expect(next).not.toHaveBeenCalledWith();
        expect(res.askForLessonId).toHaveBeenCalled();
    });

    test('lesson is found, should ask for confirmation', () => {
        req.lessonId = defaultLesson.id;
        const next = jest.fn();

        chain.handleRequest(req, res, next);

        delete req.has;
        expect(req.lessonToConfirm).toEqual(defaultLesson);
        expect(next).not.toHaveBeenCalledWith();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(res.askForLessonConfirm).toHaveBeenCalled();
    });

    test('req has lessonId, lesson exists but is not confirmed, user enters a new lessonId which also exists and is confirmed', () => {
        req.lessonId = 'math101';
        req.lessonToConfirm = {
            id: 'math101',
            name: 'Mathematics 101'
        };
        req.lessonConfirm = false;
        res.askForLessonId = jest.fn().mockImplementationOnce(() => {
            req.lessonId = defaultLesson.id;
            chain.handleRequest(req, res, next);
        });
        res.askForLessonConfirm = jest.fn().mockImplementationOnce(() => {
            req.lessonConfirm = true;
            chain.handleRequest(req, res, next);
        });
        const next = jest.fn();

        chain.handleRequest(req, res, next);

        expect(res.askForLessonId).toHaveBeenCalled();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(res.askForLessonConfirm).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(req.lesson).toEqual(defaultLesson);
    });

    test('lesson is not found, should ask for lesson ID again', () => {
        req.lessonId = '123';
        req.getLessonFromLessonId = jest.fn().mockReturnValueOnce(null);
        res.askForLessonId = jest.fn().mockImplementationOnce(() => {
            req.lessonId = defaultLesson.id;
            chain.handleRequest(req, res, next);
        });
        const next = jest.fn();

        chain.handleRequest(req, res, next);

        delete req.has;
        expect(req.lessonToConfirm).toBeNull();
        expect(next).not.toHaveBeenCalledWith();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith('123');
        expect(res.askForLessonId).toHaveBeenCalled();
    });
});