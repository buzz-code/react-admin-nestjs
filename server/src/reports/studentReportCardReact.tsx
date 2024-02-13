import * as React from 'react';
import { User } from 'src/db/entities/User.entity';
import { Student } from 'src/db/entities/Student.entity';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { ReactToPdfReportGenerator } from '@shared/utils/report/react-to-pdf.generator';
import { StudentBaseKlass } from 'src/db/view-entities/StudentBaseKlass.entity';
import { StudentGlobalReport } from 'src/db/view-entities/StudentGlobalReport.entity';
import { Image, ImageTargetEnum } from '@shared/entities/Image.entity';
import { GradeName } from 'src/db/entities/GradeName.entity';
import { AttGradeEffect } from 'src/db/entities/AttGradeEffect';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { formatHebrewDate } from '@shared/utils/formatting/formatter.util';

interface AppProps {
    user: User;
    images: {
        reportLogo: Image;
        reportBottomLogo: Image;
    };
    student: Student;
    studentBaseKlass: StudentBaseKlass;
    reportParams: IReportParams;
    reports: StudentGlobalReport[];
    approved_abs_count: Record<number, number>;
    knownAbsByLessonAndKlass: Record<string, number>;
    att_grade_effect: AttGradeEffect[];
    grade_names: GradeName[];
};
const appStyle: React.CSSProperties = {
    fontFamily: '"Roboto", sans-serif',
    fontSize: 12,
    height: 'calc(100vh - 16px)',
}
const App: React.FunctionComponent<AppProps> = (props) => {
    return (
        <div dir='rtl' style={appStyle}>
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
            <table>
                <thead><tr><th>
                    <Header image={props.images.reportLogo} />
                </th></tr></thead>
                <tbody><tr><td>
                    <ReportTable student={props.student} studentBaseKlass={props.studentBaseKlass}
                        reports={props.reports} reportParams={props.reportParams}
                        approved_abs_count={props.approved_abs_count} knownAbsByLessonAndKlass={props.knownAbsByLessonAndKlass}
                        att_grade_effect={props.att_grade_effect} grade_names={props.grade_names} />
                    <PersonalNote note={props.reportParams.personalNote} />
                    <YomanetNotice />
                </td></tr></tbody>
                <tfoot><tr><td>
                    <Footer image={props.images.reportBottomLogo} />
                </td></tr></tfoot>
            </table>
        </div>
    );
}

const headerImageStyle: React.CSSProperties = {
    width: '95%',
    margin: '0 2.5%',
}
const Header = ({ image }: { image: Image }) => image && (
    <img src={image.fileData.src} style={headerImageStyle} />
);

const footerContainerStyle: React.CSSProperties = {
    paddingTop: '1rem',
}
const footerImageWrapperStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
}
const placeHolderFooterImageWrapperStyle: React.CSSProperties = {
    width: '100%',
    visibility: 'hidden',
}
const footerImageStyle: React.CSSProperties = {
    width: '95%',
    margin: '0 2.5%',
}
const Footer = ({ image }: { image: Image }) => image && (
    <div style={footerContainerStyle}>
        <div style={placeHolderFooterImageWrapperStyle}>
            <img src={image.fileData.src} style={footerImageStyle} />
        </div>
        <div style={footerImageWrapperStyle}>
            <img src={image.fileData.src} style={footerImageStyle} />
        </div>
    </div>
);

const PersonalNote = ({ note }: { note: string }) => note && (
    <h4>{note}</h4>
);

const yomanetNoticeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: 0,
    zIndex: 99999,
    transform: 'rotate(90deg)',
    transformOrigin: 'right top',
};
const YomanetNotice = () => (
    <small style={yomanetNoticeStyle}>
        הופק באמצעות תוכנת יומנט
    </small>
);

const containerStyle: React.CSSProperties = {
    width: 'calc(100% - 100px)',
    maxWidth: 1200,
    margin: 'auto',
    textAlign: 'center',
    paddingTop: 2,
}
interface ReportTableProps {
    student: AppProps['student'];
    studentBaseKlass: AppProps['studentBaseKlass'];
    reports: AppProps['reports'];
    reportParams: AppProps['reportParams'];
    approved_abs_count: AppProps['approved_abs_count'];
    knownAbsByLessonAndKlass: AppProps['knownAbsByLessonAndKlass'];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
interface ReportDataArrItem {
    reports: AppProps['reports'];
    id: number;
    name?: string;
    order?: number;
}
const ReportTable: React.FunctionComponent<ReportTableProps> = ({ student, studentBaseKlass, reports, reportParams, approved_abs_count, knownAbsByLessonAndKlass, att_grade_effect, grade_names }) => {
    let reportDataArr: ReportDataArrItem[] = [{ reports, id: studentBaseKlass?.id }];
    if (reportParams.groupByKlass) {
        const klasses: Record<number, ReportDataArrItem> = {}
        reports.forEach(item => {
            klasses[item.klass.name] = klasses[item.klass.name] || { name: item.klass.name, id: item.klass.id, order: item.isBaseKlass ? -1 : 1, reports: [] }
            klasses[item.klass.name].reports.push(item)
        })
        reportDataArr = Object.values(klasses).sort((a, b) => a.order - b.order)
    }

    const studentCommentHeader = [
        !reportParams.downComment && { level: 3, label: 'התמחות', value: student?.comment }
    ];
    const baseHeader = [
        { level: 2, label: 'שם התלמידה', value: student?.name },
        reportParams.showStudentTz && { level: 2, label: 'מספר תז', value: student?.tz },
        { level: 2, label: 'כיתה', value: !reportParams.groupByKlass && studentBaseKlass?.klassName },
    ];
    const middleHeader = [
        { level: 3, label: 'תאריך הנפקה', value: formatHebrewDate(new Date()) },
    ];
    const studentSmallCommentHeader = [
        reportParams.downComment && { level: 3, label: '', value: student?.comment }
    ];

    return (
        <div style={containerStyle}>
            <ReportTableHeaderWrapper items={middleHeader} justify='flex-end' />
            <ReportTableHeaderWrapper items={studentCommentHeader} />
            <ReportTableHeaderWrapper items={baseHeader} />
            <ReportTableHeaderWrapper items={studentSmallCommentHeader} />

            {reportDataArr.map((item, index) => (
                <ReportTableContent key={index} reportData={item} reportParams={reportParams}
                    approved_abs_count={approved_abs_count} knownAbsByLessonAndKlass={knownAbsByLessonAndKlass}
                    att_grade_effect={att_grade_effect} grade_names={grade_names} />
            ))}
        </div>
    );
}

const headerWrapperStyle: React.CSSProperties = {
    display: 'flex',
    paddingBottom: 12,
    paddingInline: '20px',
}
interface ReportTableHeaderWrapperProps {
    items: { level: number, label: string, value: string }[];
    align?: React.CSSProperties['alignItems'];
    justify?: React.CSSProperties['justifyContent'];
}
const ReportTableHeaderWrapper: React.FunctionComponent<ReportTableHeaderWrapperProps> = ({ items, align = 'center', justify = 'space-around' }) => {
    const itemsToShow = items.filter(Boolean).filter(item => item.value);

    return itemsToShow.length > 0 && (
        <div style={{ ...headerWrapperStyle, alignItems: align, justifyContent: justify }}>
            {itemsToShow.map((item, index) => <ReportTableHeaderItem key={index} {...item} />)}
        </div>
    );
}

const headerTagStyle: React.CSSProperties = {
    margin: 0,
}
const headerValueStyle: React.CSSProperties = {
    fontWeight: 'normal',
}
const ReportTableHeaderItem = ({ level, label, value }) => {
    if (!value) return null;

    const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
        <HeaderTag style={headerTagStyle}>
            {label && <>{label}:&nbsp;</>}
            <span style={headerValueStyle}>
                <ReportTableValueWithLineBreak value={value} />
            </span>
        </HeaderTag>
    );
};
const ReportTableValueWithLineBreak = ({ value }) => {
    if (!value) return null;

    const parts = value.split('&');
    if (parts.length === 1) return value;

    return parts.map((item, index) => (
        <div key={index}>{item}</div>
    ));
}

const reportDataWrapperStyle: React.CSSProperties = {
    paddingTop: '2rem',
}
const reportDataWrapperStyle2: React.CSSProperties = {
    pageBreakInside: 'avoid',
    ...reportDataWrapperStyle,
}
const commonTableStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: 12,
    textAlign: 'center',
    fontSize: 16,
}
const tableStyle: React.CSSProperties = {
    ...commonTableStyle,
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '.5em',
}
const thStyle: React.CSSProperties = {
    ...commonTableStyle,
    border: '3px solid black',
}
const rightAlignThStyle: React.CSSProperties = {
    ...thStyle,
    textAlign: 'right',
}
const fullCellStyle: React.CSSProperties = {
    ...commonTableStyle,
    minWidth: 75,
    maxWidth: 100,
}
const rightAlignFullCellStyle: React.CSSProperties = {
    ...fullCellStyle,
    textAlign: 'right',
}
const emptyCellStyle: React.CSSProperties = {
    ...commonTableStyle,
    minWidth: 60,
}
interface ReportTableContentProps {
    reportData: ReportDataArrItem;
    reportParams: AppProps['reportParams'];
    approved_abs_count: AppProps['approved_abs_count'];
    knownAbsByLessonAndKlass: AppProps['knownAbsByLessonAndKlass'];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
const ReportTableContent: React.FunctionComponent<ReportTableContentProps> = ({ reportData, reportParams, approved_abs_count, knownAbsByLessonAndKlass, att_grade_effect, grade_names }) => {
    const reportTableHeader = [
        { level: 2, label: '', value: reportParams.groupByKlass && reportData.name }
    ]

    return (
        <div style={reportParams.groupByKlass ? reportDataWrapperStyle2 : reportDataWrapperStyle}>
            <ReportTableHeaderWrapper items={reportTableHeader} />
            <table style={tableStyle}>
                {reportData.reports.length > 0 && <>
                    <tr>
                        <th style={rightAlignThStyle}>מקצוע</th>
                        <th style={thStyle}>שם המורה</th>
                        {reportParams.attendance && <th style={thStyle}>אחוז נוכחות</th>}
                        {reportParams.grades && <th style={thStyle}>ציון</th>}
                    </tr>

                    {reportData.reports.map((item, index) => (
                        <ReportItem key={index} reportParams={reportParams} report={item}
                            knownAbsByLessonAndKlass={knownAbsByLessonAndKlass} att_grade_effect={att_grade_effect} grade_names={grade_names} />
                    ))}

                    {!reportParams.hideAbsTotal && reportParams.attendance && (
                        <ReportAbsTotal id={reportData.id} reports={reportData.reports} reportParams={reportParams} approved_abs_count={approved_abs_count} />
                    )}
                </>}
            </table>
        </div>
    );
}

interface ReportItemProps {
    reportParams: AppProps['reportParams'];
    report: AppProps['reports'][number];
    knownAbsByLessonAndKlass: AppProps['knownAbsByLessonAndKlass'];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
const ReportItem: React.FunctionComponent<ReportItemProps> = ({ reportParams, report, knownAbsByLessonAndKlass, att_grade_effect, grade_names }) => {
    if (
        (reportParams.forceGrades && (report.gradeAvg === undefined || report.gradeAvg === null)) ||
        (reportParams.forceAtt && !report.lessonsCount)
    ) {
        return null;
    }

    var knownAbs = knownAbsByLessonAndKlass[`${report.klass?.id}_${report.lesson?.id}`] ?? 0;
    var unKnownAbs = Math.max(0, (report.absCount ?? 0) - knownAbs);
    var att_percents = Math.round((((report.lessonsCount ?? 1) - (unKnownAbs)) / (report.lessonsCount ?? 1)) * 100)

    var grade_effect = att_grade_effect?.find(item => item.percents <= att_percents || item.count >= unKnownAbs)?.effect ?? 0
    var isOriginalGrade = report.gradeAvg > 100 || report.gradeAvg == 0
    var affected_grade = isOriginalGrade ? report.gradeAvg : Math.min(100, report.gradeAvg + grade_effect)
    var matching_grade_name = grade_names?.find(item => item.key <= affected_grade)?.name || null

    return <tr>
        <td style={rightAlignFullCellStyle}>{report.lesson && report.lesson.name}</td>
        <td style={fullCellStyle}>{report.teacher && report.teacher.name}</td>

        {(report.lessonsCount && report.lessonsCount * 2 == report.absCount)
            ? <>
                {reportParams.attendance && <td style={fullCellStyle}>&nbsp;</td>}
                <td style={fullCellStyle}>{Math.round(report.gradeAvg)}</td>
            </>
            : <>
                {reportParams.attendance && <td style={fullCellStyle}>{Math.round(att_percents)}%</td>}
                {reportParams.grades && (
                    <td style={fullCellStyle}>
                        {(report.gradeAvg != undefined && report.gradeAvg != null)
                            ? (matching_grade_name ?? (Math.round(affected_grade) + '%'))
                            : <>&nbsp;</>
                        }
                    </td>
                )}
            </>}
    </tr>;
}

interface ReportAbsTotalProps {
    id: number;
    reports: AppProps['reports'];
    reportParams: AppProps['reportParams'];
    approved_abs_count: AppProps['approved_abs_count'];
}
const ReportAbsTotal: React.FunctionComponent<ReportAbsTotalProps> = ({ id, reports, reportParams, approved_abs_count }) => {
    var reportsNoSpecial = reports.filter(item => item.lessonsCount * 2 != item.absCount)
    var total_lesson_count = reportsNoSpecial.reduce((a, b) => a + b.lessonsCount, 0)
    var total_abs_count = reportsNoSpecial.reduce((a, b) => a + b.absCount, 0)
    var total_att_count = total_lesson_count - total_abs_count
    var approved_abs_value = approved_abs_count?.[id]
    if (!reportParams.groupByKlass) {
        approved_abs_value = Object.values(approved_abs_count)[0]
    }

    return <>
        <tr>
            <th style={thStyle}>אחוז נוכחות כללי</th>
            <th style={thStyle}>&nbsp;</th>
            <th style={thStyle}>
                {Math.round(((total_att_count) / total_lesson_count) * 100)}%
            </th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
        </tr>
        <tr>
            <th style={thStyle}>נוכחות בקיזוז חיסורים מאושרים</th>
            <th style={thStyle}>&nbsp;</th>
            <th style={thStyle}>
                {Math.round(
                    (
                        (
                            total_att_count + (approved_abs_value || 0)
                        ) / total_lesson_count
                    ) * 100
                )}%
            </th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
        </tr>
    </>
}

export interface IReportParams {
    userId: number;
    studentId: number;
    year: number;
    attendance: boolean;
    grades: boolean;
    personalNote?: string;
    groupByKlass?: boolean;
    hideAbsTotal?: boolean;
    forceGrades?: boolean;
    forceAtt?: boolean;
    showStudentTz?: boolean;
    downComment?: boolean;
}
export const getReportData: IGetReportDataFunction<IReportParams, AppProps> = async (params, dataSource) => {
    const [user, student, studentReports, studentBaseKlass, reportLogo, reportBottomLogo, knownAbsences, att_grade_effect, grade_names] = await Promise.all([
        dataSource.getRepository(User).findOneBy({ id: params.userId }),
        dataSource.getRepository(Student).findOneBy({ id: params.studentId }),
        dataSource.getRepository(StudentGlobalReport).find({
            where: { studentReferenceId: params.studentId },
            relations: {
                lesson: true,
                klass: true,
                teacher: true,
            }
        }),
        dataSource.getRepository(StudentBaseKlass).findOneBy({ id: params.studentId, year: params.year }),
        dataSource.getRepository(Image).findOneBy({ userId: params.userId, imageTarget: ImageTargetEnum.reportLogo }),
        dataSource.getRepository(Image).findOneBy({ userId: params.userId, imageTarget: ImageTargetEnum.reportBottomLogo }),
        dataSource.getRepository(KnownAbsence).findBy({ studentReferenceId: params.studentId, isApproved: true }),
        dataSource.getRepository(AttGradeEffect).find({ where: { userId: params.userId }, order: { percents: 'DESC', count: 'DESC' } }),
        dataSource.getRepository(GradeName).find({ where: { userId: params.userId }, order: { key: 'DESC' } }),
    ])
    const approved_abs_count = knownAbsences.reduce((acc, item) => ({ ...acc, [item.klassReferenceId]: (acc[item.klassReferenceId] || 0) + item.absnceCount }), {})
    const knownAbsByLessonAndKlass = knownAbsences.reduce((acc, item) => {
        const key = `${item.klassReferenceId}_${item.lessonReferenceId}`
        acc[key] = (acc[key] || 0) + item.absnceCount
        return acc;
    }, {});

    if (params.attendance && !params.grades) {
        params.forceAtt = true;
    }
    if (params.grades && !params.attendance) {
        params.forceGrades = true;
    }

    return {
        user,
        images: { reportLogo, reportBottomLogo },
        student,
        studentBaseKlass,
        reportParams: params,
        reports: studentReports,
        approved_abs_count,
        knownAbsByLessonAndKlass,
        att_grade_effect,
        grade_names,
    };
}

export const getReportName = data => `תעודה לתלמידה ${data.student?.name} כיתה ${data.studentBaseKlass?.klassName}`;

export default new ReactToPdfReportGenerator(getReportName, getReportData, App);
