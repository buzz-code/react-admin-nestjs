import { pascalCase } from "change-case";
import getResourceConfirmationChain from "./resourceWithConfirmation.chain";

const resource = 'lesson';
const chain = getResourceConfirmationChain(resource, req => req.getLessonFromLessonId(req.params[resource].id));

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
                [resource]: {
                    id: undefined,
                    data: undefined,
                    dataToConfirm: undefined,
                    isConfirmed: undefined,
                }
            },
            getLessonFromLessonId: jest.fn().mockResolvedValue(defaultLesson),
        };
        res = {
            continueMock: false,
            send: jest.fn(async (msg: string) => {
                switch (msg) {
                    case `type${pascalCase(resource)}Id`:
                        req.params[resource].id = defaultLesson.id;
                        break;
                    case `confirm${pascalCase(resource)}`:
                        req.params[resource].isConfirmed = true;
                        break;
                }
                if (res.continueMock) {
                    await chain.handleRequest(req, res, next);
                }
            }),
            getText: jest.fn(key => key),
        };
        next = jest.fn(() => Promise.resolve());
    });

    test('lesson is defined, should early exit chain', async () => {
        req.params[resource].data = defaultLesson;

        await chain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('lesson is confirmed, should set lesson and exit chain', async () => {
        req.params[resource].id = defaultLesson.id;
        req.params[resource].dataToConfirm = defaultLesson;
        req.params[resource].isConfirmed = true;

        await chain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.params[resource].data).toEqual(defaultLesson);
    });

    test('lesson ID is not defined, should ask for lesson ID', async () => {
        await chain.handleRequest(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(`type${pascalCase(resource)}Id`);
    });

    test('lesson is found, should ask for confirmation', async () => {
        req.params[resource].id = defaultLesson.id;

        await chain.handleRequest(req, res, next);

        expect(req.params[resource].dataToConfirm).toEqual(defaultLesson);
        expect(next).not.toHaveBeenCalled();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(res.send).toHaveBeenCalledWith(`confirm${pascalCase(resource)}`);
    });

    test('req has lessonId, lesson exists but is not confirmed, user enters a new lessonId which also exists and is confirmed', async () => {
        req.params[resource].id = 'math101';
        req.params[resource].dataToConfirm = {
            id: 'math101',
            name: 'Mathematics 101'
        };
        req.params[resource].isConfirmed = false;
        res.continueMock = true;

        await chain.handleRequest(req, res, next);

        expect(res.send).toBeCalledTimes(2);
        expect(res.send).toHaveBeenNthCalledWith(1, `type${pascalCase(resource)}Id`);
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith(defaultLesson.id);
        expect(req.params[resource].dataToConfirm).toEqual(defaultLesson);
        expect(res.send).toHaveBeenNthCalledWith(2, `confirm${pascalCase(resource)}`);
        expect(next).toHaveBeenCalled();
        expect(req.params[resource].data).toEqual(defaultLesson);
    });

    test('lesson is not found, should ask for lesson ID again', async () => {
        req.params[resource].id = '123';
        req.getLessonFromLessonId = jest.fn().mockReturnValueOnce(null);

        await chain.handleRequest(req, res, next);

        expect(req.params[resource].dataToConfirm).toBeNull();
        expect(next).not.toHaveBeenCalled();
        expect(req.getLessonFromLessonId).toHaveBeenCalledWith('123');
        expect(res.send).toHaveBeenCalledWith(`type${pascalCase(resource)}Id`);
    });
});