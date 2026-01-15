import { Injectable } from "@nestjs/common";
import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { PhoneTemplate } from "src/db/entities/PhoneTemplate.entity";
import { YemotApiService } from "src/services/yemot-api.service";

@Injectable()
class PhoneTemplateService extends BaseEntityService<PhoneTemplate> {
  constructor(private readonly yemotApiService: YemotApiService) {
    super();
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const userId = req.auth?.userId;
    
    switch (req.parsed.extra.action) {
      case 'test': {
        // Test campaign with single phone number
        const { templateId, phoneNumber } = body;
        
        if (!templateId || !phoneNumber) {
          return { error: 'Missing templateId or phoneNumber' };
        }

        const template = await this.repo.findOne({ 
          where: { id: templateId, userId } 
        });
        
        if (!template) {
          return { error: 'Template not found' };
        }

        // Get user's Yemot API key
        const user = await this.dataSource.getRepository('User').findOne({ 
          where: { id: userId },
          select: ['id', 'additionalData']
        });
        
        const apiKey = user?.additionalData?.yemotApiKey;
        if (!apiKey) {
          return { error: 'Yemot API key not configured' };
        }

        try {
          // Upload single phone number
          await this.yemotApiService.uploadPhoneList(apiKey, template.yemotTemplateId, [
            { phone: phoneNumber }
          ]);

          // Run test campaign
          const result = await this.yemotApiService.runCampaign(apiKey, template.yemotTemplateId, {
            ttsText: template.messageText,
            callerId: template.callerId,
          });

          return { 
            success: true, 
            message: 'Test call initiated',
            campaignId: result.id 
          };
        } catch (error) {
          return { error: error.message };
        }
      }
    }
    
    return super.doAction(req, body);
  }

  async createOne(req: CrudRequest, dto: PhoneTemplate): Promise<PhoneTemplate> {
    const userId = req.auth?.userId;
    
    // Get user's Yemot API key
    const user = await this.dataSource.getRepository('User').findOne({ 
      where: { id: userId },
      select: ['id', 'additionalData']
    });
    
    const apiKey = user?.additionalData?.yemotApiKey;
    if (!apiKey) {
      throw new Error('Yemot API key not configured in user settings');
    }

    // Create Yemot template
    const yemotResponse = await this.yemotApiService.createTemplate(
      apiKey,
      dto.description || dto.name
    );

    if (yemotResponse.responseStatus !== 'OK' || !yemotResponse.template) {
      throw new Error(`Failed to create Yemot template: ${yemotResponse.message || 'Unknown error'}`);
    }

    // Set yemotTemplateId and userId
    dto.yemotTemplateId = yemotResponse.template;
    dto.userId = userId;

    return super.createOne(req, dto);
  }
}

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: PhoneTemplate,
    service: PhoneTemplateService,
    providers: [YemotApiService],
  };
}

export default getConfig();
