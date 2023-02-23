export class YemotRequest {
    params: any;
    dataSource: any;
    async getLessonFromLessonId(lessonId: string) {
        return { lessonId };
    }
}
export class YemotResponse {
    send(msg: string) { }
};

export interface IHandler {
    handleRequest: (req: YemotRequest, res: YemotResponse, callback: Function) => Promise<any>;
}

export class Chain implements IHandler {
    handlers: IHandler[];

    constructor(handlers: IHandler[] = []) {
        this.handlers = handlers;
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, callback: Function) {
        let index = 0;
        const next = async () => {
            if (index < this.handlers.length) {
                const handler = this.handlers[index];
                index++;
                // console.log('handler name:', handler.constructor.name)
                await handler.handleRequest(req, res, (handled: Boolean) => {
                    if (handled) {
                        return callback(true);
                    } else {
                        return next();
                    }
                });
            } else {
                return callback(false);
            }
        };
        return next();
    }

    addHandler(handler: IHandler) {
        this.handlers.push(handler);
    }
}

export abstract class Handler implements IHandler {
    handleRequest(req: YemotRequest, res: YemotResponse, callback: Function): any {
        return callback();
    };
}
