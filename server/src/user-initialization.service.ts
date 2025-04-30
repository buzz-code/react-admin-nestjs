import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@shared/entities/User.entity';
import { IUserInitializationService } from '@shared/auth/user-initialization.interface';
import { ReportMonth } from './db/entities/ReportMonth.entity';
import { getCurrentHebrewYear, getCurrentYearMonths } from '@shared/utils/entity/year.util';

@Injectable()
export class UserInitializationService implements IUserInitializationService {
  constructor(
    @InjectRepository(ReportMonth) private reportMonthRepository: Repository<ReportMonth>,
  ) { }

  async initializeUserData(user: User): Promise<void> {
    await this.generateReportMonthsForUser(user);
  }

  private async generateReportMonthsForUser(user: User): Promise<void> {
    const formatter = new Intl.DateTimeFormat('he', { month: 'long' });
    const reportMonths: Partial<ReportMonth>[] = getCurrentYearMonths()
      .map(monthStartDate => ({
        userId: user.id,
        name: formatter.format(monthStartDate),
        startDate: monthStartDate,
        endDate: new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 0),
        year: getCurrentHebrewYear()
      }))
    await this.reportMonthRepository.save(reportMonths);
  }
}