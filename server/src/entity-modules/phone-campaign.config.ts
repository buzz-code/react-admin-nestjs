import { Injectable } from "@nestjs/common";
import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions, InjectEntityRepository } from "@shared/base-entity/interface";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { PhoneCampaign, PhoneEntry } from "src/db/entities/PhoneCampaign.entity";
import { PhoneTemplate } from "src/db/entities/PhoneTemplate.entity";
import { YemotApiService } from "src/services/yemot-api.service";
import { Repository } from "typeorm";
import { MailSendService } from "@shared/utils/mail/mail-send.service";

@Injectable()
export class PhoneCampaignService extends BaseEntityService<PhoneCampaign> {
  constructor(
    @InjectEntityRepository repo: Repository<PhoneCampaign>,
    mailSendService: MailSendService,
    private readonly yemotApiService: YemotApiService
  ) {
    super(repo, mailSendService);
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const userId = (req as any).auth?.userId;
    
    switch (req.parsed.extra.action) {
      case 'refresh-status': {
        const { campaignId } = body;
        
        if (!campaignId) {
          return { error: 'Missing campaignId' };
        }

        return this.refreshCampaignStatus(campaignId, userId);
      }
    }
    
    return super.doAction(req, body);
  }

  /**
   * Execute a phone campaign
   * Called by entity services (e.g., StudentAttendanceService)
   */
  async executeCampaign(
    userId: number,
    templateId: number,
    phoneNumbers: PhoneEntry[]
  ): Promise<any> {
    // Validate inputs
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No phone numbers provided');
    }

    // Get template
    const template = await this.dataSource.getRepository(PhoneTemplate).findOne({
      where: { id: templateId, userId }
    });

    if (!template) {
      throw new Error('Template not found or access denied');
    }

    if (!template.isActive) {
      throw new Error('Template is not active');
    }

    // Get user's Yemot API key
    const user = await this.dataSource.getRepository('User').findOne({
      where: { id: userId },
      select: ['id', 'additionalData']
    });

    const apiKey = user?.additionalData?.yemotApiKey;
    if (!apiKey) {
      throw new Error('Yemot API key not configured');
    }

    // Create campaign record
    const campaign = this.repo.create({
      userId,
      phoneTemplateId: templateId,
      status: 'pending',
      totalPhones: phoneNumbers.length,
      phoneNumbers,
      successfulCalls: 0,
      failedCalls: 0,
    });

    await this.repo.save(campaign);

    try {
      // Upload phone list to Yemot
      await this.yemotApiService.uploadPhoneList(
        apiKey,
        template.yemotTemplateId,
        phoneNumbers
      );

      // Run campaign
      const result = await this.yemotApiService.runCampaign(
        apiKey,
        template.yemotTemplateId,
        {
          ttsText: template.messageText,
          callerId: template.callerId,
        }
      );

      if (result.responseStatus !== 'OK' || !result.id) {
        throw new Error(`Failed to run campaign: ${result.message || 'Unknown error'}`);
      }

      // Update campaign with Yemot campaign ID
      campaign.yemotCampaignId = result.id;
      campaign.status = 'running';
      await this.repo.save(campaign);

      return {
        success: true,
        campaignId: campaign.id,
        yemotCampaignId: result.id,
        message: `Campaign started with ${phoneNumbers.length} phone numbers`,
      };
    } catch (error) {
      // Update campaign with error
      campaign.status = 'failed';
      campaign.errorMessage = error.message;
      await this.repo.save(campaign);

      throw error;
    }
  }

  /**
   * Refresh campaign status from Yemot
   */
  async refreshCampaignStatus(campaignId: number, userId: number): Promise<any> {
    const campaign = await this.repo.findOne({
      where: { id: campaignId, userId }
    });

    if (!campaign) {
      return { error: 'Campaign not found or access denied' };
    }

    if (!campaign.yemotCampaignId) {
      return { error: 'Campaign has no Yemot ID' };
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
      const status = await this.yemotApiService.getCampaignStatus(
        apiKey,
        campaign.yemotCampaignId
      );

      // Update campaign with latest status
      if (status.calls !== undefined) {
        campaign.totalPhones = status.calls;
      }
      if (status.answered !== undefined) {
        campaign.successfulCalls = status.answered;
      }
      if (status.failed !== undefined || status.notAnswered !== undefined) {
        campaign.failedCalls = (status.failed || 0) + (status.notAnswered || 0);
      }

      // Update status based on Yemot response
      if (status.status) {
        if (status.status.toLowerCase().includes('complete')) {
          campaign.status = 'completed';
          campaign.completedAt = new Date();
        } else if (status.status.toLowerCase().includes('fail')) {
          campaign.status = 'failed';
        } else if (status.status.toLowerCase().includes('running') || status.status.toLowerCase().includes('active')) {
          campaign.status = 'running';
        }
      }

      await this.repo.save(campaign);

      return {
        success: true,
        campaign: {
          id: campaign.id,
          status: campaign.status,
          totalPhones: campaign.totalPhones,
          successfulCalls: campaign.successfulCalls,
          failedCalls: campaign.failedCalls,
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: PhoneCampaign,
    // @ts-ignore - Service with additional dependencies, see docs/shared-modifications.md
    service: PhoneCampaignService,
    providers: [YemotApiService],
  };
}

export default getConfig();
