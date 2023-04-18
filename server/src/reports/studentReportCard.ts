import * as React from 'react';
import { User } from 'src/db/entities/User.entity';
import { Student } from 'src/db/entities/Student.entity';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { EjsToPdfReportDefinition, IGetReportDataFunction, ReactToPdfReportDefinition } from '@shared/utils/report/report.generators';
import { StudentBaseKlass } from 'src/db/view-entities/StudentBaseKlass';

const reportTemplate = `
<!DOCTYPE html>
<html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

        <% /* %>
        <%- include('../../common-modules/templates/custom-font', { font }); %>
        <% */ %>

        <style>
            body {
                direction: rtl;
                font-family: CustomFont, 'Roboto', sans-serif;
                font-size: 12px;
                min-height: 21cm;
            }
            .container {
                width: calc(100% - 100px);
                max-width: 1200px;
                margin: auto;
                text-align: center;
                padding-top: 2px;
            }
            .header-wrapper {
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                -webkit-justify-content: space-around;
                -ms-justify-content: space-around;
                justify-content: space-around;
                padding-bottom: 4px;
                padding-inline: 20%;
            }
            h1, h2, h3 {
                margin: 0;
            }
            .value {
                font-weight: normal;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin-top: .5em;
            }
            table, th, td {
                border: 1px solid black;
                padding: 4px;
            }
            th {
                /* background-color: #727fc9; */
                border: 3px solid black;
                /* font-size: 1.25rem; */
                /* color: white; */
            }
            .full-cell {
                min-width: 75px;
                max-width: 100px;
            }
            .empty_cell {
                min-width: 60px;
            }
            .end-image {
                position: fixed;
                bottom: 0;
                right: 0;
                width: 100%;
            }
            small.notice {
                position: absolute;
                top: 50%;
                right: 0;
                z-index: 99999;
                -webkit-transform: rotate(90deg);
                transform: rotate(90deg);
                transform-origin: right top;
            }
        </style>
    </head>
    <body>
        <% /* %>
        <%- include('header', { img }); %>
        <% */ %>

        <% var reportDataArr = [{reports}] %>
        <% if (reportParams.groupByKlass) { %>
            <% var klasses = {} %>
            <% reports.forEach(item => {
                klasses[item.klass_name] = klasses[item.klass_name] || { name: item.klass_name, reports: [] }
                klasses[item.klass_name].reports.push(item)
            }) %>
            <% reportDataArr = Object.values(klasses).sort((a, b) => a.name?.trim()?.localeCompare(b.name?.trim())) %>
        <% } %>

        <div class="container">
            <div class="header-wrapper">
                <% if (student && student.comment) { %>
                    <h1>התמחות:
                        <span class="value"><%= student.comment %></span>
                    </h1>
                <% } %>
            </div>
            <div class="header-wrapper">
                <% if (student) { %>
                    <h2>שם התלמידה: 
                        <span class="value"><%= student.name %></span>
                    </h2>
                <% } %>
                <% if (studentBaseKlass && !reportParams.groupByKlass) { %>
                    <h2>כיתה: 
                        <span class="value"><%= studentBaseKlass.studentBaseKlass %></span>
                    </h2>
                <% } %>
            </div>

            <% reportDataArr.forEach(reportData => { %>
                <div class="header-wrapper">
                    <% if (reportParams.groupByKlass) { %>
                        <h2>כיתה: 
                            <span class="value"><%= reportData.name %></span>
                        </h2>
                    <% } %>
                </div>
    
                <% var reports = reportData.reports %>
                <table>
                <% if (reports.length > 0) { %>
                    <tr>
                        <th>מקצוע</th>
                        <th>שם המורה</th>
                        <% if (reportParams.grades) { %>
                            <th>ציון</th>
                        <% } %>
                        <th>אחוז נוכחות</th>
                    </tr>
                    <% reports.forEach((report, index) => { %>
                        <% if (
                            (!reportParams.forceGrades || (report.grade != undefined && report.grade != null)) &&
                            (!reportParams.forceAtt || (report.lessons))
                        ) { %>
                            <tr>
                                <td class="full-cell"><%= report.lesson_name %></td>
                                <td class="full-cell"><%= report.teacher_name %></td>

                                <% var att_percents = Math.round(((report.lessons - report.abs_count) / report.lessons) * 100) %> 
                                
                                <% if (report.lessons * 2 == report.abs_count) { %>
                                    <td class="full-cell"><%= report.grade %></td>
                                    <td class="full-cell">&nbsp;</td>
                                <% } else { %>
                                    <% if (reportParams.grades) { %>
                                        <td class="full-cell">
                                        <% if (report.grade != undefined && report.grade != null) { %>
                                            <% var grade_effect = att_grade_effect?.find(item => item.percents <= att_percents)?.effect ?? 0 %> 
                                            <% var isOriginalGrade = report.grade > 100 || report.grade == 0 %>
                                            <% var affected_grade = isOriginalGrade ? report.grade : Math.min(100, report.grade + grade_effect) %> 
                                            <% var matching_grade_name = grade_names?.find(item => item.key <= affected_grade)?.name %> 

                                            <% if (matching_grade_name) { %> 
                                                <%= matching_grade_name %>
                                            <% } else { %> 
                                                <%= affected_grade %>%
                                            <% } %> 
                                        <% } else { %>
                                            &nbsp;
                                        <% } %>
                                        </td>
                                    <% } %>
                                    <td class="full-cell"><%= att_percents %>%</td>
                                <% } %>
                            </tr>
                        <% } %>
                    <% }) %>
                    <% if (!reportParams.hideAbsTotal) { %>
                        <tr>
                            <th>אחוז נוכחות כללי</th>
                            <th>&nbsp;</th>
                            <% if (reportParams.grades) { %>
                                <th>&nbsp;</th>
                            <% } %>

                            <% var reportsNoSpecial = reports.filter(item => item.lessons * 2 != item.abs_count) %>
                            <% var total_lesson_count = reportsNoSpecial.reduce((a, b) => a + b.lessons, 0) %> 
                            <% var total_abs_count = reportsNoSpecial.reduce((a, b) => a + b.abs_count, 0) %> 
                            <% var total_att_count = total_lesson_count - total_abs_count %> 

                            <th>
                                <%= 
                                    Math.round(((total_att_count) / total_lesson_count) * 100)
                                %>%
                            </th>
                        </tr>
                        <tr>
                            <th>נוכחות בקיזוז חיסורים מאושרים</th>
                            <th>&nbsp;</th>
                            <% if (reportParams.grades) { %>
                                <th>&nbsp;</th>
                            <% } %>
                            <th>
                                <%= 
                                    Math.round(((total_att_count + (approved_abs_count?.total || 0)) / total_lesson_count) * 100)
                                %>%
                            </th>
                        </tr>
                    <% } %>
                <% } %>
                </table>
            <% }) %>

            <% if (reportParams.personalNote) { %>
                <h4>
                    <%= reportParams.personalNote %>
                </h4>
            <% } %>
        </div>
        <small class="notice">הופק באמצעות תוכנת יומנט</small>
        <div class="end-image">
          <% /* %>
          <%- include('image', { img: footerImage }); %>
          <% */ %>
        </div>
    </body>
</html>
`;

const reportOptions: ejs.Options = {
    compileDebug: true,
};

const getReportData: IGetReportDataFunction = async (dataSource, params) => {
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
        dataSource.getRepository(StudentBaseKlass).findOneBy({ id: params.studentId }),
    ])
    return {
        user,
        student,
        attReports,
        studentBaseKlass,
        reportParams: {},
        reports: [],
    };
}

export default new EjsToPdfReportDefinition('studentReportCard', getReportData, reportTemplate, reportOptions);
