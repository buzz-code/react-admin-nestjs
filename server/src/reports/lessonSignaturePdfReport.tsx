import * as React from 'react';
import { DataSource, In } from 'typeorm';
import { ImportFile } from '@shared/entities/ImportFile.entity';
import { ReportGroup } from 'src/db/entities/ReportGroup.entity';
import { ReportGroupSession } from 'src/db/entities/ReportGroupSession.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { Grade } from 'src/db/entities/Grade.entity';
import { Student } from 'src/db/entities/Student.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { convertToReactStyle, ReportStyles } from '@shared/utils/report/react-user-styles/reportStyles';
import { wrapWithStyles, useStyles, useFontLinks } from '@shared/utils/report/react-user-styles/StylesContext';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { ReactToPdfReportGenerator } from '@shared/utils/report/react-to-pdf.generator';

// Define report element types for styling
enum ReportElementType {
  DOCUMENT = 'document',              // Main container
  TITLE_PRIMARY = 'titlePrimary',     // Main title (h1)
  TITLE_SECONDARY = 'titleSecondary', // Section headers (h2)
  SUBTITLE = 'subtitle',               // Date subtitle
  INFO_TABLE = 'infoTable',           // Lesson details table
  INFO_LABEL = 'infoLabel',           // Bold labels in info table
  TABLE_HEADER = 'tableHeader',       // Student table headers
  TABLE_CELL = 'tableCell',           // Student table cells
  SIGNATURE_TITLE = 'signatureTitle', // Signature section title
  FOOTER_TEXT = 'footerText',         // Footer text
}

const defaultReportStyles: ReportStyles = [
  {
    type: ReportElementType.DOCUMENT,
    fontFamily: 'Roboto',
    fontSize: 14,  // Default for most elements
    isBold: false,
    isItalic: false
  },
  {
    type: ReportElementType.TITLE_PRIMARY,
    fontSize: 24,
    isBold: true,
  },
  {
    type: ReportElementType.TITLE_SECONDARY,
    fontSize: 18,
    isBold: true,
  },
  {
    type: ReportElementType.INFO_LABEL,
    isBold: true,
  },
  {
    type: ReportElementType.TABLE_HEADER,
    isBold: true,
  },
  {
    type: ReportElementType.SIGNATURE_TITLE,
    fontSize: 16,
    isBold: true,
  },
  {
    type: ReportElementType.FOOTER_TEXT,
    fontSize: 10,
  }
];

export interface LessonSignaturePdfParams {
  userId: number;
  importFileId?: number;
  reportGroupId?: number;
}

export interface LessonSignaturePdfData {
  // Core metadata
  id: number;
  userId: number;
  createdAt: Date;
  
  // Lesson context
  teacher: Teacher;
  lesson: Lesson;
  klass: Klass;
  
  // Report data
  entityName: 'att_report' | 'grade';
  studentRecords: Array<{
    student: Student;
    data: AttReport | Grade;
    sessionId?: number;
  }>;
  
  // Signature and session details
  signatureData?: string;
  sessions: Array<{
    id?: number;
    date: Date;
    startTime?: string;
    endTime?: string;
    topic?: string;
  }>;
}

interface ErrorReportData {
  error: true;
  message: string;
  id: number;
}

const getReportData: IGetReportDataFunction = async (
  params: LessonSignaturePdfParams,
  dataSource: DataSource
): Promise<LessonSignaturePdfData | ErrorReportData> => {
  // Handle ReportGroup path
  if (params.reportGroupId) {
    return getReportDataFromReportGroup(params, dataSource);
  }
  
  // Handle ImportFile path (legacy)
  if (params.importFileId) {
    return getReportDataFromImportFile(params, dataSource);
  }

  return {
    error: true,
    message: 'חסר מזהה קובץ או מזהה קבוצת דיווח',
    id: 0
  };
};

// Get report data from ReportGroup
async function getReportDataFromReportGroup(
  params: LessonSignaturePdfParams,
  dataSource: DataSource
): Promise<LessonSignaturePdfData | ErrorReportData> {
  // 1. Load ReportGroup with relations
  const reportGroup = await dataSource.getRepository(ReportGroup).findOne({
    where: {
      id: params.reportGroupId,
      userId: params.userId,
    },
    relations: ['teacher', 'lesson', 'klass', 'sessions']
  });

  if (!reportGroup) {
    console.log(`ReportGroup ${params.reportGroupId} not found`);
    return {
      error: true,
      message: 'קבוצת דיווח לא נמצאה',
      id: params.reportGroupId
    };
  }

  if (!reportGroup.sessions || reportGroup.sessions.length === 0) {
    console.log(`ReportGroup ${params.reportGroupId} has no sessions`);
    return {
      error: true,
      message: 'קבוצת הדיווח לא כולל מפגשים',
      id: params.reportGroupId
    };
  }

  // 2. Load all AttReports and Grades for these sessions
  const sessionIds = reportGroup.sessions.map(s => s.id);
  
  const [attReports, grades] = await Promise.all([
    dataSource.getRepository(AttReport).find({
      where: { reportGroupSessionId: In(sessionIds) },
      relations: ['student']
    }),
    dataSource.getRepository(Grade).find({
      where: { reportGroupSessionId: In(sessionIds) },
      relations: ['student']
    })
  ]);

  // 3. Combine records (prioritize AttReports, then Grades)
  const recordsMap = new Map();
  
  // Add AttReports first
  attReports.forEach(report => {
    const key = `${report.reportGroupSessionId}-${report.studentReferenceId}`;
    recordsMap.set(key, {
      student: report.student,
      data: report,
      sessionId: report.reportGroupSessionId
    });
  });

  // Add Grades if no AttReport exists for that student/session
  grades.forEach(grade => {
    const key = `${grade.reportGroupSessionId}-${grade.studentReferenceId}`;
    if (!recordsMap.has(key)) {
      recordsMap.set(key, {
        student: grade.student,
        data: grade,
        sessionId: grade.reportGroupSessionId
      });
    }
  });

  const studentRecords = Array.from(recordsMap.values());

  if (studentRecords.length === 0) {
    console.log(`ReportGroup ${params.reportGroupId} has no records`);
    return {
      error: true,
      message: 'לא נמצאו רשומות עבור קבוצת הדיווח',
      id: params.reportGroupId
    };
  }

  // 4. Build sessions array from ReportGroup sessions
  const sessions = reportGroup.sessions.map(session => ({
    id: session.id,
    date: new Date(session.sessionDate),
    startTime: session.startTime,
    endTime: session.endTime,
    topic: session.topic || reportGroup.topic
  }));

  // 5. Return clean ReportGroup-based structure
  return {
    id: reportGroup.id,
    userId: reportGroup.userId,
    createdAt: reportGroup.createdAt,
    teacher: reportGroup.teacher,
    lesson: reportGroup.lesson,
    klass: reportGroup.klass,
    entityName: attReports.length > 0 ? 'att_report' : 'grade',
    studentRecords,
    signatureData: reportGroup.signatureData,
    sessions
  };
}

// Get report data from ImportFile (legacy path)
async function getReportDataFromImportFile(
  params: LessonSignaturePdfParams,
  dataSource: DataSource
): Promise<LessonSignaturePdfData | ErrorReportData> {
  // 1. Load ImportFile
  const importFile = await dataSource.getRepository(ImportFile).findOne({
    where: {
      id: params.importFileId,
      userId: params.userId,
    }
  });

  // Return error for rows without metadata
  if (!importFile || !importFile.metadata) {
    console.log(`Skipping import file ${params.importFileId} - no metadata found`);
    return {
      error: true,
      message: 'לא נמצא מטא-דאטה עבור קובץ זה (חתימה/פרטי שיעור)',
      id: params.importFileId
    };
  }

  // 2. Determine entity (att_report or grade) - map string to entity class
  const entityClassMap = {
    'att_report': AttReport,
    'grade': Grade,
  };

  const entityClass = entityClassMap[importFile.entityName];
  if (!entityClass) {
    console.log(`Skipping import file ${params.importFileId} - unknown entity type: ${importFile.entityName}`);
    return {
      error: true,
      message: `סוג ישות לא נתמך: ${importFile.entityName}`,
      id: params.importFileId
    };
  }

  const entityRepo = dataSource.getRepository(entityClass);

  // 3. Load records by entityIds
  const records = await entityRepo.find({
    where: { id: In(importFile.entityIds) },
    relations: ['student', 'teacher', 'lesson', 'klass']
  });

  if (!records.length) {
    console.log(`Skipping import file ${params.importFileId} - no records found`);
    return {
      error: true,
      message: 'לא נמצאו רשומות עבור קובץ זה',
      id: params.importFileId
    };
  }

  // 4. Extract shared details (teacher, lesson, class)
  const firstRecord = records[0];
  const teacher = firstRecord.teacher;
  const lesson = firstRecord.lesson;
  const klass = firstRecord.klass;

  // 5. Build data for report
  const studentRecords = records.map(record => ({
    student: record.student,
    data: record as AttReport | Grade
  }));

  // 6. Build sessions array from metadata.dateDetails
  const sessions: Array<{
    date: Date;
    startTime?: string;
    endTime?: string;
    topic?: string;
  }> = [];

  if (importFile.metadata.dateDetails) {
    Object.entries(importFile.metadata.dateDetails).forEach(([dateStr, details]: [string, any]) => {
      sessions.push({
        date: new Date(dateStr),
        startTime: details.lessonStartTime,
        endTime: details.lessonEndTime,
        topic: details.lessonTopic
      });
    });
  }

  // 7. Return unified structure (adapted from ImportFile)
  return {
    id: importFile.id,
    userId: importFile.userId,
    createdAt: importFile.createdAt,
    teacher,
    lesson,
    klass,
    entityName: importFile.entityName as 'att_report' | 'grade',
    studentRecords,
    signatureData: importFile.metadata.signatureData,
    sessions
  };
}

const getReportName = () => 'קבצי דיווח למורה';

// Helper function to get entity-specific config
const getEntityConfig = (entityName: string) => {
  const configs = {
    att_report: {
      title: 'טופס נוכחות',
      columnHeader: 'חיסורים',
      valueField: 'absCount',
      showComments: false
    },
    grade: {
      title: 'טופס ציונים',
      columnHeader: 'ציון',
      valueField: 'grade',
      showComments: true
    },
    // Easy to add more entities in the future:
    // att_grade_effect: { title: 'טופס השפעת נוכחות על ציון', ... }
  };

  return configs[entityName] || configs.att_report; // default fallback
};

// ============================================================================
// COMMON COMPONENT: HTML Document Wrapper
// ============================================================================
interface HtmlDocumentProps {
  title: string;
  children: React.ReactNode;
}

const HtmlDocument: React.FC<HtmlDocumentProps> = ({ title, children }) => {
  const fontLinks = useFontLinks();

  const containerStyle: React.CSSProperties = {
    ...convertToReactStyle(useStyles(ReportElementType.DOCUMENT)),
    direction: 'rtl',
    padding: '20px',
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        {fontLinks.map((link, index) => (<link key={index} rel='stylesheet' href={link} />))}
      </head>
      <body>
        <div style={containerStyle}>
          {children}
        </div>
      </body>
    </html>
  );
};

// ============================================================================
// COMPONENT 1: Main Report Container
// ============================================================================

interface LessonDetails {
  lessonStartTime?: string;
  lessonEndTime?: string;
  lessonTopic?: string;
}

// Helper to get lesson details for a specific session
const getLessonDetailsForSession = (sessions: LessonSignaturePdfData['sessions'], sessionId?: number, fallbackDate?: Date): LessonDetails => {
  if (!sessions || sessions.length === 0) {
    return {};
  }

  // Try to find by sessionId first (more accurate for ReportGroups)
  if (sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      return {
        lessonStartTime: session.startTime,
        lessonEndTime: session.endTime,
        lessonTopic: session.topic
      };
    }
  }

  // Fallback to date matching (for ImportFile legacy path)
  if (fallbackDate) {
    const dateString = fallbackDate.toISOString().split('T')[0];
    const session = sessions.find(s => 
      new Date(s.date).toISOString().split('T')[0] === dateString
    );
    if (session) {
      return {
        lessonStartTime: session.startTime,
        lessonEndTime: session.endTime,
        lessonTopic: session.topic
      };
    }
  }

  return {};
};

const LessonSignatureReport: React.FunctionComponent<LessonSignaturePdfData | ErrorReportData> = (props) => {
  // Handle error case
  if ('error' in props && props.error) {
    return (
      <HtmlDocument title="שגיאה ביצירת דוח">
        <ErrorReport message={props.message} id={props.id} />
      </HtmlDocument>
    );
  }

  // Handle success case - cast to correct type after error check
  const data = props as LessonSignaturePdfData;
  const { id, teacher, lesson, klass, studentRecords, entityName, sessions, signatureData, createdAt } = data;
  const entityConfig = getEntityConfig(entityName);

  // Group records by sessionId (if available) or date
  const recordsBySession = studentRecords.reduce((acc, record) => {
    // Use sessionId as key if available, otherwise use date
    const key = record.sessionId 
      ? `session-${record.sessionId}` 
      : `date-${new Date(record.data.reportDate).toISOString().split('T')[0]}`;
    
    if (!acc[key]) {
      acc[key] = {
        records: [],
        sessionId: record.sessionId,
        date: new Date(record.data.reportDate)
      };
    }
    acc[key].records.push(record);
    return acc;
  }, {} as Record<string, { records: typeof studentRecords; sessionId?: number; date: Date }>);

  const sessionKeys = Object.keys(recordsBySession).sort();
  const isMultipleSessions = sessionKeys.length > 1;

  return (
    <HtmlDocument title={getReportName()}>
      <ReportHeader
        title={entityConfig.title}
        date={createdAt}
      />

      {isMultipleSessions ? (
        // Multiple sessions: show section per session
        sessionKeys.map((key, index) => {
          const sessionData = recordsBySession[key];
          return (
            <React.Fragment key={key}>
              {index > 0 && <div style={{ pageBreakBefore: 'always' }} />}
              <LessonDetailsSection
                lesson={lesson}
                teacher={teacher}
                klass={klass}
                sessions={sessions}
                sessionId={sessionData.sessionId}
                reportDate={sessionData.date}
              />
              <StudentRecordsTable
                studentRecords={sessionData.records}
                entityConfig={entityConfig}
                entityName={entityName}
              />
            </React.Fragment>
          );
        })
      ) : (
        // Single session: show as before
        <>
          <LessonDetailsSection
            lesson={lesson}
            teacher={teacher}
            klass={klass}
            sessions={sessions}
            sessionId={studentRecords[0]?.sessionId}
            reportDate={studentRecords.length > 0 ? new Date(studentRecords[0].data.reportDate) : undefined}
          />
          <StudentRecordsTable
            studentRecords={studentRecords}
            entityConfig={entityConfig}
            entityName={entityName}
          />
        </>
      )}

      {signatureData && (
        <SignatureSection signatureData={signatureData} />
      )}
      <ReportFooter />
    </HtmlDocument>
  );
};

// ============================================================================
// ERROR COMPONENT: Error Report
// ============================================================================
const ErrorReport: React.FC<{ message: string; id: number }> = ({ message, id }) => {
  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    border: '2px solid #f44336',
    borderRadius: '8px',
    backgroundColor: '#ffebee',
    marginTop: '20px',
  };

  const titleStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.TITLE_PRIMARY)),
    color: '#d32f2f',
    marginBottom: '20px',
  };

  const messageStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.SUBTITLE)),
    color: '#c62828',
    marginBottom: '10px',
  };

  const detailsStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.FOOTER_TEXT)),
    color: '#666',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>⚠️ שגיאה ביצירת דוח</h1>
      <p style={messageStyle}>{message}</p>
      <p style={detailsStyle}>מזהה: {id}</p>
      <p style={detailsStyle}>נא לוודא שהנתונים כוללים מטא-דאטה (חתימה ופרטי שיעור)</p>
    </div>
  );
};

// ============================================================================
// COMPONENT 2: Report Header
// ============================================================================
const ReportHeader: React.FC<{ title: string; date: Date }> = ({ title, date }) => {
  const headerContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '30px',
  };

  const titleStyle = convertToReactStyle(useStyles(ReportElementType.TITLE_PRIMARY));
  const subtitleStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.SUBTITLE)),
    color: '#666',
  };

  return (
    <div style={headerContainerStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <p style={subtitleStyle}>
        תאריך: {new Date(date).toLocaleDateString('he-IL')}
      </p>
    </div>
  );
};

// ============================================================================
// COMPONENT 3: Lesson Details Section
// ============================================================================
interface LessonDetailsSectionProps {
  lesson: Lesson;
  teacher: Teacher;
  klass: Klass;
  sessions: LessonSignaturePdfData['sessions'];
  sessionId?: number;
  reportDate?: Date;
}

const LessonDetailsSection: React.FC<LessonDetailsSectionProps> = ({
  lesson,
  teacher,
  klass,
  sessions,
  sessionId,
  reportDate
}) => {
  const sectionContainerStyle: React.CSSProperties = {
    marginBottom: '20px',
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '5px',
  };

  const sectionTitleStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.TITLE_SECONDARY)),
    marginBottom: '10px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    ...convertToReactStyle(useStyles(ReportElementType.INFO_TABLE)),
  };

  const labelStyle = convertToReactStyle(useStyles(ReportElementType.INFO_LABEL));
  const cellStyle: React.CSSProperties = {
    width: '150px',
    ...labelStyle,
  };

  const lessonDetails = getLessonDetailsForSession(sessions, sessionId, reportDate);

  return (
    <div style={sectionContainerStyle}>
      <h2 style={sectionTitleStyle}>פרטי השיעור</h2>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={cellStyle}>שם השיעור:</td>
            <td>{lesson.name}</td>
          </tr>
          <tr>
            <td style={cellStyle}>מורה:</td>
            <td>{teacher.name}</td>
          </tr>
          <tr>
            <td style={cellStyle}>כיתה:</td>
            <td>{klass.name}</td>
          </tr>
          {reportDate && (
            <tr>
              <td style={cellStyle}>תאריך:</td>
              <td>{reportDate.toLocaleDateString('he-IL')}</td>
            </tr>
          )}
          {lessonDetails.lessonStartTime && (
            <tr>
              <td style={cellStyle}>שעת תחילת השיעור:</td>
              <td>{lessonDetails.lessonStartTime}</td>
            </tr>
          )}
          {lessonDetails.lessonEndTime && (
            <tr>
              <td style={cellStyle}>שעת סיום השיעור:</td>
              <td>{lessonDetails.lessonEndTime}</td>
            </tr>
          )}
          {lessonDetails.lessonTopic && (
            <tr>
              <td style={cellStyle}>נושא השיעור:</td>
              <td>{lessonDetails.lessonTopic}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// COMPONENT 4: Student Records Table
// ============================================================================
interface StudentRecordsTableProps {
  studentRecords: LessonSignaturePdfData['studentRecords'];
  entityConfig: ReturnType<typeof getEntityConfig>;
  entityName: string;
}

const StudentRecordsTable: React.FC<StudentRecordsTableProps> = ({
  studentRecords,
  entityConfig,
  entityName
}) => {
  const containerStyle: React.CSSProperties = {
    marginBottom: '30px',
  };

  const sectionTitleStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.TITLE_SECONDARY)),
    marginBottom: '10px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
  };

  const commonCellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
  };

  const headerStyle = {
    ...commonCellStyle,
    backgroundColor: '#f5f5f5',
    ...convertToReactStyle(useStyles(ReportElementType.TABLE_HEADER)),
  };

  const cellStyle = {
    ...commonCellStyle,
    ...convertToReactStyle(useStyles(ReportElementType.TABLE_CELL)),
  };

  const centerCellStyle = {
    ...cellStyle,
    textAlign: 'center' as const,
  };

  return (
    <div style={containerStyle}>
      <h2 style={sectionTitleStyle}>רשימת תלמידות</h2>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={headerStyle}>שם</th>
            <th style={headerStyle}>{entityConfig.columnHeader}</th>
            {entityConfig.showComments && (
              <th style={headerStyle}>הערות</th>
            )}
          </tr>
        </thead>
        <tbody>
          {studentRecords.map((record, index) => (
            <tr key={index}>
              <td style={cellStyle}>{record.student.name}</td>
              <td style={centerCellStyle}>
                {record.data[entityConfig.valueField] ?? '-'}
              </td>
              {entityConfig.showComments && (
                <td style={cellStyle}>{record.data.comments || '-'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// COMPONENT 5: Signature Section
// ============================================================================
const SignatureSection: React.FC<{ signatureData: string }> = ({ signatureData }) => {
  const containerStyle: React.CSSProperties = {
    marginTop: '40px',
    textAlign: 'center',
  };

  const titleStyle = convertToReactStyle(useStyles(ReportElementType.SIGNATURE_TITLE));

  const imageStyle: React.CSSProperties = {
    maxWidth: '300px',
    maxHeight: '150px',
    border: '1px solid #ddd',
    padding: '10px',
    marginTop: '10px',
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>חתימת המורה</h3>
      <img src={signatureData} alt="חתימה" style={imageStyle} />
    </div>
  );
};

// ============================================================================
// COMPONENT 6: Report Footer
// ============================================================================
const ReportFooter: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    marginTop: '50px',
    paddingTop: '20px',
    borderTop: '1px solid #ddd',
    textAlign: 'center',
  };

  const textStyle = {
    ...convertToReactStyle(useStyles(ReportElementType.FOOTER_TEXT)),
    color: '#666',
  };

  return (
    <div style={containerStyle}>
      <p style={textStyle}>מסמך זה הופק אוטומטית באמצעות מערכת ניהול בית הספר</p>
      <p style={textStyle}>תאריך הפקה: {new Date().toLocaleDateString('he-IL')}</p>
    </div>
  );
};

export default new ReactToPdfReportGenerator(
  getReportName,
  getReportData,
  wrapWithStyles(LessonSignatureReport, defaultReportStyles)
);
