import { generalResourceFieldsTranslation } from "@shared/providers/i18nProvider"

export default {
    resources: {
        att_report: {
            name: 'רשומת נוכחות |||| נוכחות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                'studentBaseKlass.klassName': 'כיתת בסיס',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
                lessonId: 'שיעור',
                lessonReferenceId: 'שיעור',
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
                klassTypeReferenceId: 'סוג כיתה',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
            }
        },
        klass_type: {
            name: 'סוג כיתה |||| סוגי כיתה',
            fields: {
                ...generalResourceFieldsTranslation,
                klassTypeEnum: 'סוג כיתה בדו"ח',
            }
        },
        known_absence: {
            name: 'חיסור מאושר |||| חיסורים מאושרים',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
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
                teacherReferenceId: 'מורה',
                startDate: 'תאריך התחלה',
                endDate: 'תאריך סיום',
            }
        },
        student_klass: {
            name: 'רשומת שיוך תלמידות לכיתות |||| שיוך תלמידות לכיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
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
                studentReferenceId: 'תלמידה',
                klasses1: 'כיתת אם',
                klasses2: 'מסלול',
                klasses3: 'התמחות',
                klassesNull: 'אחר',
            }
        },
        import_file: {
            name: 'קבצים שהועלו',
            fields: {
                ...generalResourceFieldsTranslation,
                fileName: 'שם הקובץ',
                entityIds: 'מזהים',
                entityName: 'סוג טבלה',
            }
        },
    }
};
