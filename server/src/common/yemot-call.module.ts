import { YemotCall as Entity, YemotParams } from "../entities/YemotCall";
import { snakeCase } from "snake-case";

// sevice
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { Users } from "src/entities/Users";
import yemotUtil from "./yemot.util";

@Injectable()
export class EntityService extends TypeOrmCrudService<Entity> {
  constructor(@InjectRepository(Entity) repo, @InjectRepository(Users) private userRepo: Repository<Users>) {
    super(repo);
  }

  // {"ApiCallId":"754b9ce7c434ea952f2ed99671c274fee143165a","ApiYFCallId":"9da82d44-c071-4c61-877b-1680d75968e6","ApiDID":"035586526","ApiRealDID":"035586526","ApiPhone":"0527609942","ApiExtension":"","ApiTime":"1669485562","reportDateType":"2","reportDate":"10112022","reportDateConfirm":"1","questionAnswer":"1","howManyLessons":"2","howManyWatchOrIndividual":"1","howManyTeachedOrInterfering":"0","wasKamal":"0","howManyDiscussingLessons":"1"}
  async handleCall(body: YemotParams) {
    const activeCall = await this.getActiveCall(body);
    try {
      if (body.hangup) {
        if (activeCall.currentStep != 'hangup') {
          throw new Error('Unexpected hangup');
        } else {
          this.closeCall(activeCall, body);
        }
      } else {
        const { response, nextStep } = await this.processCall(activeCall, body);
        this.saveStep(activeCall, body, response, nextStep);
        return response;
      }
    }
    catch (e) {
      activeCall.isOpen = false;
      activeCall.hasError = true;
      activeCall.errorMessage = e.message;
      this.repo.save(activeCall);

      return yemotUtil.hangup();
    }
  }

  private async getText(textKey: string, ...args): Promise<string> {
    // use cache
    return 'text: ' + textKey;
  }
  private async getActiveCall(body: YemotParams) {
    const userFilter = {
      phoneNumber: body.ApiDID
    };
    const call = await this.repo.findOne({
      where: {
        apiCallId: body.ApiCallId
      }
    });
    if (call) {
      return call;
    }
    const user = await this.userRepo.findOneByOrFail(userFilter)
    return this.repo.create({
      user,
      apiCallId: body.ApiCallId,
      phone: body.ApiPhone,
      isOpen: true,
      history: [],
      currentStep: 'initial',
      data: {},
    })
  }
  private async processCall(activeCall: Entity, body: any): Promise<{ response: string; nextStep: string; }> {
    switch (activeCall.currentStep) {
      case 'initial': {
        return {
          response: yemotUtil.send(
            yemotUtil.id_list_message_v2(await this.getText('welcome')),
            yemotUtil.read_v2(await this.getText('type teacher id'), 'teacherId', { min: 1, max: 9 })
          ),
          nextStep: 'got-teacher-id'
        }
      }
      case 'got-teacher-id': {
        // const teacher = await this.teacherRepo.findOneBy({id: body.teacherId});
        return {
          response: yemotUtil.send(
            yemotUtil.read_v2('great ' + body.teacherId, 'nothing')
          ),
          nextStep: 'end-call',
        }
      }
      default: {
        return {
          response: yemotUtil.send(
            yemotUtil.hangup()
          ),
          nextStep: 'error-not-impl-step'
        }
      }
    }
  }
  private saveStep(activeCall: Entity, body: YemotParams, response: string, nextStep: string) {
    activeCall.currentStep = nextStep;
    activeCall.history.push({
      params: body,
      response,
      time: new Date(),
    })
    this.repo.save(activeCall);
  }
  private closeCall(activeCall: Entity, body: YemotParams) {
    activeCall.isOpen = false;
    activeCall.history.push({
      params: body,
      response: 'hangup',
      time: new Date(),
    })
    this.repo.save(activeCall);
  }
}


// controller
import { Controller, UseGuards, Post, Request, Body } from "@nestjs/common";
import { Crud, CrudController, CrudAuth } from "@nestjsx/crud";
import { CrudAuthFilter } from "src/auth/crud-auth.filter";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Crud({
  model: {
    type: Entity,
  },
})
// @UseGuards(JwtAuthGuard)
// @CrudAuth(CrudAuthFilter)
@Controller(snakeCase(Entity.name))
export class EntityController implements CrudController<Entity> {
  constructor(public service: EntityService) { }

  @Post('handle-call')
  async handleCall(@Request() req, @Body() body) {
    return this.service.handleCall(body)
  }
}


// module
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Entity, Users])],
  providers: [EntityService],
  exports: [EntityService],
  controllers: [EntityController],
})
export class YemotCallModule { }
