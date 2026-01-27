import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface YemotCreateTemplateResponse {
  responseStatus: string;
  template?: string;
  message?: string;
}

export interface YemotRunCampaignResponse {
  responseStatus: string;
  id?: string;
  message?: string;
}

export interface YemotCampaignStatus {
  responseStatus: string;
  calls?: number;
  answered?: number;
  notAnswered?: number;
  failed?: number;
  status?: string;
}

@Injectable()
export class YemotApiService {
  private readonly logger = new Logger(YemotApiService.name);
  private readonly baseUrl = 'https://www.call2all.co.il/ym/api';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Create a new Yemot campaign template
   */
  async createTemplate(apiKey: string, description: string): Promise<YemotCreateTemplateResponse> {
    try {
      this.logger.log(`Creating Yemot template: ${description}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/CreateTemplate`,
          {},
          {
            headers: {
              'authorization': apiKey,
            },
            params: {
              description,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }

  /**
   * Update template settings
   */
  async updateTemplateSettings(
    apiKey: string,
    templateId: string,
    settings: Record<string, any>
  ): Promise<any> {
    try {
      this.logger.log(`Updating template ${templateId} settings`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/UpdateTemplate`,
          {},
          {
            headers: {
              'authorization': apiKey,
            },
            params: {
              template: templateId,
              ...settings,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update template: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }

  /**
   * Upload phone list to template
   */
  async uploadPhoneList(
    apiKey: string,
    templateId: string,
    phones: Array<{ phone: string; name?: string }>
  ): Promise<any> {
    try {
      this.logger.log(`Uploading ${phones.length} phones to template ${templateId}`);
      
      // Format phones as colon-separated list: phone:name
      const phoneList = phones.map(p => `${p.phone}${p.name ? ':' + p.name : ''}`).join(',');
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/UploadPhoneList`,
          {},
          {
            headers: {
              'authorization': apiKey,
            },
            params: {
              template: templateId,
              phones: phoneList,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to upload phone list: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }

  /**
   * Run campaign with TTS mode
   */
  async runCampaign(
    apiKey: string,
    templateId: string,
    options: {
      ttsText: string;
      callerId?: string;
    }
  ): Promise<YemotRunCampaignResponse> {
    try {
      this.logger.log(`Running campaign for template ${templateId}`);
      
      const params: any = {
        template: templateId,
        ttsMode: 1, // TTS mode
        ttsText: options.ttsText,
      };

      if (options.callerId) {
        params.callerId = options.callerId;
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/RunCampaign`,
          {},
          {
            headers: {
              'authorization': apiKey,
            },
            params,
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to run campaign: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }

  /**
   * Get campaign status
   */
  async getCampaignStatus(apiKey: string, campaignId: string): Promise<YemotCampaignStatus> {
    try {
      this.logger.log(`Getting status for campaign ${campaignId}`);
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/GetCampaignStatus`,
          {
            headers: {
              'authorization': apiKey,
            },
            params: {
              campaignId,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get campaign status: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }

  /**
   * Download campaign report
   */
  async downloadCampaignReport(apiKey: string, campaignId: string): Promise<any> {
    try {
      this.logger.log(`Downloading report for campaign ${campaignId}`);
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/DownloadCampaignReport`,
          {
            headers: {
              'authorization': apiKey,
            },
            params: {
              campaignId,
            },
          }
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to download campaign report: ${error.message}`, error.stack);
      throw new Error(`Yemot API error: ${error.message}`);
    }
  }
}
