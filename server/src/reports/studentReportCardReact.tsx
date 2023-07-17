import * as React from 'react';
import { User } from 'src/db/entities/User.entity';
import { Student } from 'src/db/entities/Student.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { IGetReportDataFunction, ReactToPdfReportGenerator } from '@shared/utils/report/report.generators';
import { StudentBaseKlass } from 'src/db/view-entities/StudentBaseKlass.entity';

interface AppProps {
    user: User;
    student: Student;
    studentBaseKlass: StudentBaseKlass;
    reportParams: any;
    reports: AttReport[];
    approved_abs_count: any;
    att_grade_effect: any[];
    grade_names: any[];
};
const appStyle: React.CSSProperties = {
    fontFamily: '"Roboto", sans-serif',
    fontSize: 12,
    minHeight: '21cm',
}
const App: React.FunctionComponent<AppProps> = (props) => {
    return (
        <div dir='rtl' style={appStyle}>
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
            <Header />
            <ReportTable student={props.student} studentBaseKlass={props.studentBaseKlass}
                reports={props.reports} reportParams={props.reportParams} approved_abs_count={props.approved_abs_count}
                att_grade_effect={props.att_grade_effect} grade_names={props.grade_names} />
            <PersonalNote note={props.reportParams.personalNote} />
            <YomanetNotice />
            <Footer />
        </div>
    );
}

const Header = () => <div>לוגו</div>;

const Footer = () => <div>לוגו תחתי</div>;

const PersonalNote = ({ note }) => note && (<h4>{note}</h4>);

const yomanetNoticeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: 0,
    zIndex: 99999,
    transform: 'rotate(90deg)',
    transformOrigin: 'right top',
};
const YomanetNotice = () => <small style={yomanetNoticeStyle}>הופק באמצעות תוכנת יומנט</small>;

const containerStyle: React.CSSProperties = {
    width: 'calc(100% - 100px)',
    maxWidth: 1200,
    margin: 'auto',
    textAlign: 'center',
    paddingTop: 2,
}
const ReportTable = ({ student, studentBaseKlass, reports, reportParams, approved_abs_count, att_grade_effect, grade_names }) => {
    let reportDataArr: any[] = [{ reports }];
    if (reportParams.groupByKlass) {
        const klasses = {}
        reports.forEach(item => {
            klasses[item.klass.name] = klasses[item.klass.name] || { name: item.klass.name, reports: [] }
            klasses[item.klass.name].reports.push(item)
        })
        reportDataArr = Object.values(klasses)
            .sort((a, b) => (a as any).name?.trim()?.localeCompare((b as any).name?.trim()))
    }

    const studentCommentHeader = [
        { level: 1, label: 'התמחות', value: student?.comment }
    ];
    const baseHeader = [
        { level: 2, label: 'שם התלמידה', value: student?.name },
        { level: 2, label: 'כיתה', value: !reportParams.groupByKlass && studentBaseKlass?.studentBaseKlass },
    ]

    return (
        <div style={containerStyle}>
            <ReportTableHeaderWrapper items={studentCommentHeader} />
            <ReportTableHeaderWrapper items={baseHeader} />

            {reportDataArr.map((item, index) => (
                <ReportTableContent key={index} reportData={item} reportParams={reportParams}
                    approved_abs_count={approved_abs_count} att_grade_effect={att_grade_effect} grade_names={grade_names} />
            ))}
        </div>
    );
}

const headerWrapperStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    paddingBottom: 4,
    paddingInline: '20%',
}
const ReportTableHeaderWrapper = ({ items }) => (
    <div style={headerWrapperStyle}>
        {items.map((item, index) => <ReportTableHeaderItem key={index} {...item} />)}
    </div>
)

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
        <HeaderTag style={headerTagStyle}>{label}:
            <span style={headerValueStyle}>{value}</span>
        </HeaderTag>
    );
};

const commonTableStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: 4,
    textAlign: 'center',
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
const fullCellStyle: React.CSSProperties = {
    ...commonTableStyle,
    minWidth: 75,
    maxWidth: 100,
}
const emptyCellStyle: React.CSSProperties = {
    ...commonTableStyle,
    minWidth: 60,
}
const ReportTableContent = ({ reportData, reportParams, approved_abs_count, att_grade_effect, grade_names }) => {
    const reportTableHeader = [
        { level: 2, label: 'כיתה', value: reportParams.groupByKlass && reportData.name }
    ]

    return (
        <>
            <ReportTableHeaderWrapper items={reportTableHeader} />
            <table style={tableStyle}>
                {reportData.reports.length > 0 && <>
                    <tr>
                        <th style={thStyle}>מקצוע</th>
                        <th style={thStyle}>שם המורה</th>
                        {reportParams.grades && <th style={thStyle}>ציון</th>}
                        <th style={thStyle}>אחוז נוכחות</th>
                    </tr>

                    {reportData.reports.map((item, index) => (
                        <ReportItem key={index} reportParams={reportParams} report={item}
                            att_grade_effect={att_grade_effect} grade_names={grade_names} />
                    ))}

                    {!reportParams.hideAbsTotal && (
                        <ReportAbsTotal reports={reportData.reports} reportParams={reportParams} approved_abs_count={approved_abs_count} />
                    )}
                </>}
            </table>
        </>
    );
}

const ReportItem = ({ reportParams, report, att_grade_effect, grade_names }) => {
    if (
        !(
            (!reportParams.forceGrades || (report.grade != undefined && report.grade != null)) &&
            (!reportParams.forceAtt || (report.howManyLessons))
        )
    ) {
        return null;
    }

    var att_percents = Math.round(((report.howManyLessons - report.absCount) / report.howManyLessons) * 100)

    var grade_effect = att_grade_effect?.find(item => item.percents <= att_percents)?.effect ?? 0
    var isOriginalGrade = report.grade > 100 || report.grade == 0
    var affected_grade = isOriginalGrade ? report.grade : Math.min(100, report.grade + grade_effect)
    var matching_grade_name = grade_names?.find(item => item.key <= affected_grade)?.name

    return <tr>
        <td style={fullCellStyle}>{report.lesson && report.lesson.name}</td>
        <td style={fullCellStyle}>{report.teacher && report.teacher.name}</td>

        {(report.howManyLessons && report.howManyLessons * 2 == report.absCount)
            ? <>
                <td style={fullCellStyle}>{report.grade}</td>
                <td style={fullCellStyle}>&nbsp;</td>
            </>
            : <>
                {reportParams.grades && (
                    <td style={fullCellStyle}>
                        {(report.grade != undefined && report.grade != null)
                            ? (matching_grade_name ?? affected_grade)
                            : <>&nbsp;</>
                        }
                    </td>
                )}
                <td style={fullCellStyle}>{att_percents}%</td>
            </>}
    </tr>;
}

const ReportAbsTotal = ({ reports, reportParams, approved_abs_count }) => {
    var reportsNoSpecial = reports.filter(item => item.howManyLessons * 2 != item.absCount)
    var total_lesson_count = reportsNoSpecial.reduce((a, b) => a + b.howManyLessons, 0)
    var total_abs_count = reportsNoSpecial.reduce((a, b) => a + b.absCount, 0)
    var total_att_count = total_lesson_count - total_abs_count

    return <>
        <tr>
            <th style={thStyle}>אחוז נוכחות כללי</th>
            <th style={thStyle}>&nbsp;</th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
            <th style={thStyle}>
                {Math.round(((total_att_count) / total_lesson_count) * 100)}%
            </th>
        </tr>
        <tr>
            <th style={thStyle}>נוכחות בקיזוז חיסורים מאושרים</th>
            <th style={thStyle}>&nbsp;</th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
            <th style={thStyle}>
                {Math.round(((total_att_count + (approved_abs_count?.total || 0)) / total_lesson_count) * 100)}%
            </th>
        </tr>
    </>
}

const getReportData: IGetReportDataFunction<any, AppProps> = async (params, dataSource) => {
    const [user, student, attReports, studentBaseKlass] = await Promise.all([
        dataSource.getRepository(User).findOneBy({ id: params.userId }),
        dataSource.getRepository(Student).findOneBy({ id: params.studentId }),
        dataSource.getRepository(AttReport).find({
            where: { studentReferenceId: params.studentId },
            relations: {
                lesson: true,
                klass: true,
                teacher: true,
            }
        }),
        dataSource.getRepository(StudentBaseKlass).findOneBy({ id: params.studentId, year: params.year }),
    ])
    return {
        user,
        student,
        studentBaseKlass,
        reportParams: {},
        reports: attReports,
        approved_abs_count: {},
        att_grade_effect: null,
        grade_names: null,
    };
}

const getReportName = data => `תעודה לתלמידה ${data.student?.name} כיתה ${data.studentBaseKlass?.klassName}`;

export default new ReactToPdfReportGenerator(getReportName, getReportData, App);