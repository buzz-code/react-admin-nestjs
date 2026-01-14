import { Injectable } from '@nestjs/common';
import { BaseYemotHandlerService } from '@shared/utils/yemot/v2/yemot-router.service';

/**
 * Yemot Handler Service for processing incoming Yemot calls
 * Currently returns a maintenance mode message
 */
@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  override async processCall(): Promise<void> {
    this.logger.log(`Processing call with ID: ${this.call.callId} from phone: ${this.call.phone}`);
    
    // Return maintenance mode message
    this.hangupWithMessage('המערכת במצב תחזוקה, אנא נסה שוב מאוחר יותר');
  }
}
