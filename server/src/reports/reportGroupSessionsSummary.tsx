import * as React from 'react';
import { DataSource, In } from 'typeorm';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Grade } from 'src/db/entities/Grade.entity';
import { groupDataByKeysAndCalc } from 'src/utils/reportData.util';
import { formatDate } from '@shared/utils/formatting/formatter.util';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { ReactToPdfReportGenerator } from '@shared/utils/report/react-to-pdf.generator';
import { convertToReactStyle, ReportStyles } from '@shared/utils/report/react-user-styles/reportStyles';
import { wrapWithStyles, useStyles, useFontLinks } from '@shared/utils/report/react-user-styles/StylesContext';

// Define report element types for styling
enum ReportElementType {
  DOCUMENT = 'document',
  TITLE_PRIMARY = 'titlePrimary',
  TABLE_HEADER = 'tableHeader',
  TABLE_CELL = 'tableCell',
  SIGNATURE_CELL = 'signatureCell',
}

const defaultReportStyles: ReportStyles = [
  {
    type: ReportElementType.DOCUMENT,
    fontFamily: 'Roboto',
    fontSize: 12,
    isBold: false,
    isItalic: false
  },
  {
    type: ReportElementType.TITLE_PRIMARY,
    fontSize: 20,
    isBold: true,
  },
  {
    type: ReportElementType.TABLE_HEADER,
    fontSize: 12,
    isBold: true,
  },
  {
    type: ReportElementType.TABLE_CELL,
    fontSize: 11,
  },
];

export interface ReportGroupSessionsSummaryParams {
  userId: number;
  sessionIds: number[];
}

export interface ReportGroupSessionsSummaryData {
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
  async (params, dataSource: DataSource): Promise<ReportGroupSessionsSummaryData> => {

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

    return {
      sessions: sessionRows
    };
  };

// ============================================================================
// React Component for PDF Report
// ============================================================================

interface HtmlDocumentProps {
  title: string;
  children: React.ReactNode;
}

const HtmlDocument: React.FC<HtmlDocumentProps> = ({ title, children }) => {
  const fontLinks = useFontLinks();
  
  return (
    <html dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <title>{title}</title>
        {fontLinks.map((link, index) => (<link key={index} rel='stylesheet' href={link} />))}
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 20px; direction: rtl; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f0f0f0; }
          img { max-width: 100px; max-height: 50px; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
};

const SessionsSummaryReport: React.FC<ReportGroupSessionsSummaryData> = (props) => {
  const { sessions } = props;

  const titleStyle = convertToReactStyle(useStyles(ReportElementType.TITLE_PRIMARY));
  const headerStyle = convertToReactStyle(useStyles(ReportElementType.TABLE_HEADER));
  const cellStyle = convertToReactStyle(useStyles(ReportElementType.TABLE_CELL));

  return (
    <HtmlDocument title="דוח סיכום מפגשי דיווח">
      <h1 style={{ ...titleStyle, textAlign: 'center' }}>דוח סיכום מפגשי דיווח</h1>
      
      <table>
        <thead>
          <tr>
            <th style={headerStyle}>תאריך</th>
            <th style={headerStyle}>נושא</th>
            <th style={headerStyle}>שיעור</th>
            <th style={headerStyle}>כיתה</th>
            <th style={headerStyle}>מספר שיעורים</th>
            <th style={headerStyle}>חתימת מורה</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, index) => (
            <tr key={index}>
              <td style={cellStyle}>{formatDate(session.date)}</td>
              <td style={cellStyle}>{session.topic || '-'}</td>
              <td style={cellStyle}>{session.lessonName || '-'}</td>
              <td style={cellStyle}>{session.klassName || '-'}</td>
              <td style={cellStyle}>{session.lessonCount}</td>
              <td style={cellStyle}>
                {session.signatureData && (
                  <img 
                    src={session.signatureData} 
                    alt="חתימה" 
                    style={{ maxWidth: '100px', maxHeight: '50px' }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </HtmlDocument>
  );
};

const StyledSessionsSummaryReport = wrapWithStyles(
  SessionsSummaryReport,
  defaultReportStyles
);

const getReportName = () => 'דוח סיכום מפגשי דיווח';

export default new ReactToPdfReportGenerator(
  getReportName,
  getReportData,
  StyledSessionsSummaryReport
);
