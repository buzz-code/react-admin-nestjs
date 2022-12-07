import { generalResourceFieldsTranslation } from "@buzz-code/crud-nestjs-react-admin/client/providers/i18nProvider"

export default {
    resources: {
        att_reports: {
            name: 'רשומת נוכחות |||| נוכחות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                teacherId: 'מורה',
                klassId: 'כיתה',
                lessonId: 'שיעור',
                reportDate: 'תאריך דיווח',
                howManyLessons: 'מספר שיעורים',
                absCount: 'חיסורים',
                approvedAbsCount: 'חיסורים מאושרים',
                comments: 'הערה',
                sheetName: 'חודש דיווח',
            }
        },
        grades: {
            name: 'רשומת ציונים |||| ציונים',
            fields: {
                ...generalResourceFieldsTranslation,
            }
        },
        klasses: {
            name: 'כיתה |||| כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                klassTypeId: 'סוג כיתה',
                teacherId: 'מורה',
            }
        },
        klass_types: {
            name: 'סוג כיתה |||| סוגי כיתה',
            fields: {
                ...generalResourceFieldsTranslation,
            }
        },
        known_absences: {
            name: 'חיסור מאושר |||| חיסורים מאושרים',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                reportDate: 'תאריך דיווח',
                absnceCount: 'מספר חיסורים',
                absnceCode: 'קוד חיסור',
                senderName: 'שולחת',
                reason: 'סיבה',
                comment: 'הערה',
            }
        },
        lessons: {
            name: 'שיעור |||| שיעורים',
            fields: {
                ...generalResourceFieldsTranslation,
                klasses: 'כיתות',
                teacherId: 'מורה',
                startDate: 'תאריך התחלה',
                endDate: 'תאריך סיום',
            }
        },
        student_klasses: {
            name: 'רשומת שיוך תלמידות לכיתות |||| שיוך תלמידות לכיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                klassId: 'כיתה',
            }
        },
        students: {
            name: 'תלמידה |||| תלמידות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
            }
        },
        teachers: {
            name: 'מורה |||| מורות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                phone: 'טלפון',
                phone2: 'טלפון 2',
                email: 'כתובת מייל',
            }
        },
        texts: {
            name: 'הודעה |||| הודעות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                value: 'ערך',
            }
        },
        users: {
            name: 'משתמש |||| משתמשים',
            fields: {
                ...generalResourceFieldsTranslation,
                email: 'כתובת מייל',
                password: 'סיסמא',
                phoneNumber: 'מספר טלפון',
            }
        },
        yemot_call:{
            name: 'שיחה |||| שיחות',
        }
    }
};
