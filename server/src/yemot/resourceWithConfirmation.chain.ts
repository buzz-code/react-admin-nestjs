import { pascalCase } from "change-case";
import { Chain, HandlerBase, YemotRequest, YemotResponse } from "@shared/utils/yemot/chain.interface";

class CheckIfResourceDefinedHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (!req.params[this.resource]) {
            req.params[this.resource] = {};
        }
        if (req.params[this.resource].data !== undefined) {
            // Exit the chain early if resource is already defined
            return next(true);
        } else {
            return next();
        }
    }
}

class AskForResourceIdHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource].id === undefined) {
            delete req.params[this.resource].dataToConfirm;
            return res.send(`type${pascalCase(this.resource)}Id`);
        }
        return next();
    }
}

class GetResourceFromResourceIdHandler extends HandlerBase {
    constructor(private resource: string, private getResource: (req: YemotRequest) => Promise<any>) { super(); }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource].dataToConfirm === undefined) {
            const resource = await this.getResource(req);
            req.params[this.resource].dataToConfirm = resource;
        }
        return next();
    }
}

class AskForResourceConfirmHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource].isConfirmed === undefined) {
            if (req.params[this.resource].dataToConfirm != null) {
                delete req.params[this.resource].data;
                return res.send(`confirm${pascalCase(this.resource)}`);
            } else {
                // If resource is null, ask for resource ID again
                delete req.params[this.resource].id;
                return res.send(`type${pascalCase(this.resource)}Id`);
            }
        }
        return next();
    }
}

class ConfirmResourceHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource].isConfirmed === true) {
            // Set the resource and exit the chain if confirmed
            req.params[this.resource].data = req.params[this.resource].dataToConfirm;
            return next();
        } else {
            // If not confirmed, ask for resource ID again
            delete req.params[this.resource].id;
            delete req.params[this.resource].dataToConfirm;
            delete req.params[this.resource].isConfirmed;
            return res.send(`type${pascalCase(this.resource)}Id`);
        }
    }
}

// Create the chain with the appropriate handlers
export default function getResourceConfirmationChain(resource: string, getResource: (req: YemotRequest) => Promise<any>) {
    return new Chain([
        new CheckIfResourceDefinedHandler(resource),
        new AskForResourceIdHandler(resource),
        new GetResourceFromResourceIdHandler(resource, getResource),
        new AskForResourceConfirmHandler(resource),
        new ConfirmResourceHandler(resource),
    ]);
}
