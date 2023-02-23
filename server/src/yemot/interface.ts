export class YemotRequest {
    params: any;
    dataSource: any;
    has(key: string) {
        return this.params[key] !== undefined;
    }
    getLessonFromLessonId(lessonId: string) {
        return { lessonId };
    }
}
export class YemotResponse {
    send(msg: string) { }
};

export interface IHandler {
    handleRequest: (req: YemotRequest, res: YemotResponse, callback: Function) => any;
}

export class Chain implements IHandler {
    handlers: IHandler[];

    constructor(handlers: IHandler[] = []) {
        this.handlers = handlers;
    }

    handleRequest(req: YemotRequest, res: YemotResponse, callback: Function) {
        let index = 0;
        const next = () => {
            if (index < this.handlers.length) {
                const handler = this.handlers[index];
                index++;
                handler.handleRequest(req, res, (handled: Boolean) => {
                    if (handled) {
                        callback(true);
                    } else {
                        next();
                    }
                });
            } else {
                callback(false);
            }
        };
        next();
    }

    addHandler(handler: IHandler) {
        this.handlers.push(handler);
    }
}

export abstract class Handler implements IHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, callback: Function): any {
        callback();
    };
}
