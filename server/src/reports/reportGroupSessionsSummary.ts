import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { GenericDataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Grade } from 'src/db/entities/Grade.entity';
import { In } from 'typeorm';
import { ISpecialField } from '@shared/utils/importer/types';
import { groupDataByKeysAndCalc } from 'src/utils/reportData.util';
import { formatDate } from '@shared/utils/formatting/formatter.util';

export interface ReportGroupSessionsSummaryParams {
  userId: number;
  sessionIds: number[];
}

export interface ReportGroupSessionsSummaryData extends IDataToExcelReportGenerator {
  sessions: SessionSummaryRow[];
}

interface SessionSummaryRow {
  date: Date;
  topic: string;
  lessonCount: number;
  teacherName: string;
  lessonName: string;
  klassName: string;
  signatureData?: string;
}

const getReportData: IGetReportDataFunction<ReportGroupSessionsSummaryParams, ReportGroupSessionsSummaryData> =
  async (params, dataSource): Promise<ReportGroupSessionsSummaryData> => {

    console.log('report group sessions summary params:', params);

    const { userId, sessionIds } = params;

    if (!sessionIds || sessionIds.length === 0) {
      console.log('report group sessions summary: no session IDs provided');
      return null;
    }

    // Fetch all selected sessions with their report groups
    const sessions = await dataSource.getRepository(ReportGroupSession).find({
      where: {
        id: In(sessionIds),
        userId
      },
      relations: ['reportGroup', 'reportGroup.teacher', 'reportGroup.lesson', 'reportGroup.klass'],
      order: { sessionDate: 'ASC' }
    });

    if (sessions.length === 0) {
      console.log('report group sessions summary: no sessions found');
      return null;
    }

    // Get attendance reports for these sessions to calculate lesson counts
    const attReports = await dataSource.getRepository(AttReport).find({
      where: { reportGroupSessionId: In(sessionIds) }
    });

    // Get grades for these sessions (in case no att reports)
    const grades = await dataSource.getRepository(Grade).find({
      where: { reportGroupSessionId: In(sessionIds) }
    });

    // Group by session to calculate lesson counts
    // Use max of howManyLessons (same logic as klass attendance report)
    const lessonCountsBySession = groupDataByKeysAndCalc(
      attReports,
      ['reportGroupSessionId'],
      (reports) => Math.max(...reports.map(r => r.howManyLessons || 0), 0)
    );

    // For sessions without att reports, try grades
    const gradeLessonCountsBySession = groupDataByKeysAndCalc(
      grades,
      ['reportGroupSessionId'],
      (gradeRecords) => Math.max(...gradeRecords.map(g => g.howManyLessons || 0), 0)
    );

    // Build session summary rows
    const sessionRows: SessionSummaryRow[] = sessions.map(session => {
      const lessonCount = lessonCountsBySession[session.id] || gradeLessonCountsBySession[session.id] || 0;
      const reportGroup = session.reportGroup;
      
      return {
        date: new Date(session.sessionDate),
        topic: session.topic || reportGroup?.topic || '',
        lessonCount,
        teacherName: reportGroup?.teacher?.name || '',
        lessonName: reportGroup?.lesson?.name || '',
        klassName: reportGroup?.klass?.name || '',
        signatureData: reportGroup?.signatureData
      };
    });

    console.log(`report group sessions summary: built data for ${sessionRows.length} sessions`);

    // Build Excel data
    const excelData = buildExcelData({
      sessions: sessionRows,
      headerRow: [],
      formattedData: [],
      sheetName: '',
      specialFields: []
    });

    return excelData;
  };

// Build Excel structure with special formatting
function buildExcelData(data: ReportGroupSessionsSummaryData): ReportGroupSessionsSummaryData {
  const { sessions } = data;

  console.log('buildExcelData input:', {
    sessionCount: sessions.length
  });

  const specialFields: ISpecialField[] = [];
  const images: any[] = [];

  // Define headers
  const headers = ['תאריך', 'נושא', 'שיעור', 'כיתה', 'מספר שיעורים', 'חתימת מורה'];

  // Row 0: Title
  specialFields.push({
    cell: { r: 0, c: 0 },
    value: 'דוח סיכום מפגשי דיווח',
    style: {
      font: { bold: true, size: 16, name: 'Arial' },
      alignment: {
        horizontal: 'center' as const,
        vertical: 'middle' as const,
        readingOrder: 'rtl' as const
      }
    },
    merge: { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
  });

  // Row 1: Empty (spacing)

  // Build formatted data rows for the table
  const formattedData: (string | number)[][] = sessions.map(session => [
    formatDate(session.date),
    session.topic || '',
    session.lessonName || '',
    session.klassName || '',
    session.lessonCount,
    '' // Signature column - empty, will add images later
  ]);

  // Add images for signatures (starting from row 3, after title and header)
  sessions.forEach((session, rowIndex) => {
    if (session.signatureData) {
      const rowNum = rowIndex + 3; // +3 because: title row (0), empty row (1), header row (2)
      images.push({
        imageBase64Data: session.signatureData,
        position: {
          tl: { row: rowNum, col: headers.length - 1 }, // Last column (signature)
          ext: { width: 100, height: 50 }
        }
      });
    }
  });

  console.log('buildExcelData output:', {
    rowCount: sessions.length + 3,
    specialFieldCount: specialFields.length,
    imageCount: images.length,
    formattedDataRows: formattedData.length
  });

  return {
    sessions,
    headerRow: headers,
    formattedData,
    sheetName: 'סיכום מפגשים',
    specialFields,
    images
  };
}

const getReportName = () => 'דוח סיכום מפגשי דיווח';
const generator = new GenericDataToExcelReportGenerator<ReportGroupSessionsSummaryParams>(getReportName, getReportData);

export default generator;
