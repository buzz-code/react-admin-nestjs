import { Chain, HandlerBase, IHandler, YemotRequest, YemotResponse } from "./interface";
import gradeReportChain from "./teacherByPhone.chain";
// import gradeReportChain from "./gradeReportChain";

class CheckIfReportTypeDefinedHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType !== undefined) {
            return next();
        } else {
            return res.send('getReportType');
        }
    }
}

class UseAttReportChainHandler extends HandlerBase {
    constructor(private attReportChain: IHandler) {
        super();
    }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType === '1') {
            return this.attReportChain.handleRequest(req, res, next);
        }
        return next();
    }
}

class UseGradeReportChainHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType === '2') {
            gradeReportChain.handleRequest(req, res, next);
        } else {
            return next();
        }
    }
}

export default function getReportTypeChain(attReportChain) {
    return new Chain([
        new CheckIfReportTypeDefinedHandler(),
        new UseAttReportChainHandler(attReportChain),
        new UseGradeReportChainHandler(),
    ]);
}
