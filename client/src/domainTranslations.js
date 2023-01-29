import { generalResourceFieldsTranslation } from "@shared/providers/i18nProvider"

export default {
    resources: {
        att_report: {
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
        grade: {
            name: 'רשומת ציונים |||| ציונים',
            fields: {
                ...generalResourceFieldsTranslation,
            }
        },
        klass: {
            name: 'כיתה |||| כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                klassTypeId: 'סוג כיתה',
                teacherId: 'מורה',
            }
        },
        klass_type: {
            name: 'סוג כיתה |||| סוגי כיתה',
            fields: {
                ...generalResourceFieldsTranslation,
            }
        },
        known_absence: {
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
        lesson: {
            name: 'שיעור |||| שיעורים',
            fields: {
                ...generalResourceFieldsTranslation,
                klasses: 'כיתות',
                teacherId: 'מורה',
                startDate: 'תאריך התחלה',
                endDate: 'תאריך סיום',
            }
        },
        student_klass: {
            name: 'רשומת שיוך תלמידות לכיתות |||| שיוך תלמידות לכיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                klassId: 'כיתה',
            }
        },
        student: {
            name: 'תלמידה |||| תלמידות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
            }
        },
        teacher: {
            name: 'מורה |||| מורות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                phone: 'טלפון',
                phone2: 'טלפון 2',
                email: 'כתובת מייל',
            }
        },
        text: {
            name: 'הודעה |||| הודעות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                value: 'ערך',
            }
        },
        user: {
            name: 'משתמש |||| משתמשים',
            fields: {
                ...generalResourceFieldsTranslation,
                email: 'כתובת מייל',
                password: 'סיסמא',
                phoneNumber: 'מספר טלפון',
            }
        },
        yemot_call: {
            name: 'שיחה |||| שיחות',
        },
        student_klass_report: {
            name: 'דוח שיוך תלמידה',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                klasses1: 'כיתת בסיס',
                klasses2: 'התמחות',
                klasses3: 'נוסף',
                klassesNull: 'אחר',
            }
        }
    }
};
