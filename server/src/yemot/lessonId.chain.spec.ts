import chain from './lessonId.chain';

describe('lesson chain of responsibility', () => {
    let req;
    let res;
    let next;
    const defaultLesson = {
        id: 'history101',
        name: 'History 101'
    };

    beforeEach(() => {
        // Reset req and res objects before each test
        req = {
            params: {
                lessonId: undefined,
                lesson: undefined,
                lessonToConfirm: undefined,
                lessonConfirm: undefined,
            },
            getLessonFromLessonId: jest.fn().mockResolvedValue(defaultLesson),
            has: jest.fn((prop) => req.params[prop] !== undefined),
        };
        res = {
            continueMock: false,
            send: jest.fn(async (msg: string) => {
                switch (msg) {
                    case 'askForLessonId':
                        req.params.lessonId = defaultLesson.id;
                        break;
                    case 'askForLessonConfirm':
                        req.params.lessonConfirm = true;
                        break;
                }
                if (res.continueMock) {
                    await chain.handleRequest(req, res, next);
                }
            }),
        };
        next = jest.fn(() => Promise.resolve());
    });

    test('lesson is confirmed, should set lesson and exit chain', async () => {
        req.params.lessonId = defaultLesson.id;
        req.params.lessonToConfirm = defaultLesson;
        req.params.lessonConfirm = true;

        await chain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.params.lesson).toEqual(defaultLesson);
    });

    test('lesson ID is not defined, should ask for lesson ID', async () => {
        await chain.handleRequest(req, res, next);

        expect(next).not.toHaveBeenCalledWith();
        expect(res.send).toHaveBeenCalledWith('askForLessonId');
    });

    test('lesson is found, should ask for confirmation', async () => {
        req.params.lessonId = defaultLesson.id;

        await chain.handleRequest(req, res, next);

        expect(req.params.lessonToConfirm).toEqual(defaultLesson);
        expect(next).not.toHaveBeenCalledWith();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(res.send).toHaveBeenCalledWith('askForLessonConfirm');
    });

    test('req has lessonId, lesson exists but is not confirmed, user enters a new lessonId which also exists and is confirmed', async () => {
        req.params.lessonId = 'math101';
        req.params.lessonToConfirm = {
            id: 'math101',
            name: 'Mathematics 101'
        };
        req.params.lessonConfirm = false;
        res.continueMock = true;

        await chain.handleRequest(req, res, next);

        expect(res.send).toBeCalledTimes(2);
        expect(res.send).toHaveBeenNthCalledWith(1, 'askForLessonId');
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(req.params.lessonToConfirm).toEqual(defaultLesson);
        expect(res.send).toHaveBeenNthCalledWith(2, 'askForLessonConfirm');
        expect(next).toHaveBeenCalled();
        expect(req.params.lesson).toEqual(defaultLesson);
    });

    test('lesson is not found, should ask for lesson ID again', async () => {
        req.params.lessonId = '123';
        req.getLessonFromLessonId = jest.fn().mockReturnValueOnce(null);

        await chain.handleRequest(req, res, next);

        expect(req.params.lessonToConfirm).toBeNull();
        expect(next).not.toHaveBeenCalledWith();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith('123');
        expect(res.send).toHaveBeenCalledWith('askForLessonId');
    });
});