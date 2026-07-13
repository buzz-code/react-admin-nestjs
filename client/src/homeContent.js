import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmailIcon from '@mui/icons-material/Email';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Public homepage content for anonymous visitors at "/" (see AdminAppShell's
// `homeContent` prop). Every feature below is backed by an actual capability
// in this codebase - see the commit that introduced this file for exactly
// where each one is implemented, so this stays truthful as the app evolves:
//  - in-lesson reporting: src/reports/InLessonReport.jsx (attendance + grades,
//    live during class, with late-marking)
//  - phone reporting: server/src/yemot-handler.service.ts
//    (processSeminarAttendanceCall identifies the teacher by phone number;
//    processTransportationCall handles transportation-related absences)
//  - Excel import: generic, per-entity infrastructure - shared/components/
//    crudContainers/CommonListActions.jsx renders a ResourceImportButton
//    (with preview) on any entity whose config sets `importer`; 15 entities
//    in this app already do (student, teacher, klass, lesson, att_report,
//    grade, known_absence, transportation, etc. - see `grep -rl importer
//    client/src/entities`). LessonScheduleImportButton.jsx and
//    MichlolFileHelper.jsx (auto-fills a blank מכלול template) are two
//    specific uses of the same underlying mechanism, not the whole of it.
//  - email import: nra-server/base-entity/base-entity.module.ts registers a
//    public POST /:entity/handle-email endpoint on every entity module; it
//    resolves the sender via MailAddress (unique per user+entity, so each
//    entity can get its own dedicated address), imports any Excel
//    attachment through the same importer path as the website, logs the
//    message (RecievedMail.entity.ts), and auto-replies with the result
//    (mail-send.service.ts sendEmailImportResponse). bulk-mail-file.util.ts
//    additionally sends teachers their report cards/files by mail.
//  - reports: student_percent_report, teacher_salary_report, and the
//    attendance/percent pivot views registered in App.jsx
//  - role-based views: appPermissions.js (teacherView / studentView / admin)
export default {
    eyebrow: 'מערכת ניהול נוכחות לבתי ספר וסמינרים',
    appTitle: 'נוכחות',
    tagline: 'מערכת דיגיטלית לניהול נוכחות מורות ותלמידות, דוחות וציונים - לבתי ספר וסמינרים',
    description:
        'נוכחות היא מערכת ניהול מקיפה לבתי ספר וסמינרים: דיווח נוכחות באתר, בטלפון או בשיעור עצמו, ' +
        'ייבוא ומילוי קבצים אוטומטי, ודוחות ברורים לצוות ולהנהלה - הכל במקום אחד.',
    features: [
        {
            icon: EventNoteIcon,
            title: 'דיווח נוכחות בזמן אמת',
            text: 'מורות מדווחות נוכחות וציונים ישירות במהלך השיעור, מכל מכשיר, כולל סימון איחורים.',
        },
        {
            icon: PhoneIphoneIcon,
            title: 'דיווח וזיהוי אוטומטי בטלפון',
            text: 'דיווח נוכחות בשיחת טלפון קצרה, עם זיהוי אוטומטי של המורה והשיעור לפי מספר הטלפון - גם דיווחי הסעה מתבצעים בטלפון.',
        },
        {
            icon: UploadFileIcon,
            title: 'ייבוא מאקסל לכל מסך',
            text: 'ייבוא נתונים מקובצי אקסל כמעט לכל מסך במערכת - תלמידות, מורות, כיתות, נוכחות, ציונים ועוד - עם תצוגה מקדימה לפני השמירה.',
        },
        {
            icon: EmailIcon,
            title: 'ייבוא ישירות במייל',
            text: 'לכל סוג נתונים אפשר להגדיר כתובת מייל ייעודית משלו - שולחים קובץ אקסל במייל, והמערכת מייבאת אותו אוטומטית ומשיבה עם התוצאה.',
        },
        {
            icon: SummarizeIcon,
            title: 'דוחות מותאמים אישית',
            text: 'דוחות נוכחות, ציונים ואחוזים לפי כיתה או תלמידה, עם סינון, ייצוא לאקסל ושליחה ישירה למורות במייל.',
        },
        {
            icon: AdminPanelSettingsIcon,
            title: 'הרשאות לפי תפקיד',
            text: 'כל בעל תפקיד רואה בדיוק את מה שרלוונטי לו - מנהלות, מורות ותלמידות, כל אחת עם התצוגה שלה.',
        },
    ],
    ctaLabel: 'כניסה למערכת',
};
