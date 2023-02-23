interface IHandler {
    handleRequest: (req, res, callback) => any;
}

export class Chain implements IHandler {
    handlers: IHandler[];

    constructor(handlers = []) {
        this.handlers = handlers;
    }

    handleRequest(req, res, callback) {
        let index = 0;
        const next = () => {
            if (index < this.handlers.length) {
                const handler = this.handlers[index];
                index++;
                handler.handleRequest(req, res, (handled) => {
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

    addHandler(handler) {
        this.handlers.push(handler);
    }
}

// export abstract class Handler implements IHandler {
//     handleRequest: (req: any, res: any, callback: any) => any;
// }
