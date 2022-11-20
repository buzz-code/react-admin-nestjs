import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import he from 'ra-language-hebrew-il';
import { deepMerge } from '../utils/deepMerge';

const generalResourceFieldsTranslation = {
    id: 'מזהה',
    key: 'מפתח',
    name: 'שם',
    userId: 'משתמש',
    createdAt: 'תאריך יצירה', 
    updatedAt: 'תאריך עדכון',
}

const domainTranslation = {
    ra: {
        action: {
            create_item: 'צור %{item}',
            remove_all_filters: 'איפוס כל הפילטרים',
            select_all: 'בחירת הכל',
            select_row: 'בחירת רשומה',
            update: 'עדכון',
            move_up: 'העברה מעלה',
            move_down: 'העברה מטה',
            open: 'פתיחה',
            toggle_theme: 'החלפת ערכת נושא',
            select_columns: 'עמודות',
        },
        message: {
            bulk_update_content: 'האם אתה בטוח שברצונך לעדכן %{name}? |||| האם אתה בטוח שברצונך לעדכן רשומות %{smart_count}?',
            bulk_update_title: 'עדכון %{name} |||| עדכון %{smart_count} %{name}',
        },
        navigation: {
            partial_page_range_info: '%{offsetBegin}-%{offsetEnd} מתוך יותר מ %{offsetEnd}',
            current_page: 'עמוד %{page}',
            page: 'לעמוד %{page}',
            first: 'לעמוד הראשון',
            last: 'לעמוד האחרון',
            page_rows_per_page: 'מספר רשומות בעמוד:',
            skip_nav: 'דלג לתוכן',
        },
        notification: {
            not_authorized: "אין לך הרשאה לצפות בנתונים אלו.",
        },
        saved_queries: {
            label: 'שאילתות שנשמרו',
            query_name: 'שם שאילתה',
            new_label: 'שמור שאילתא נוכחית...',
            new_dialog_title: 'שמור שאילתא נוכחית בשם',
            remove_label: 'הסרת שאילתא',
            remove_label_with_name: 'הסרת שאילתא "%{name}"',
            remove_dialog_title: 'להסיר שאילתא שמורה?',
            remove_message: 'האם אתה בטוח שברצונך להסיר את השאילתה השמורה?',
            help: 'סנן את הרשימה ושמור את השאילתא',
        },
        configurable: {
            customize: 'התאמה אישית',
            configureMode: 'התאמה אישית של העמוד',
            inspector: {
                title: 'בחר',
                content: 'רחף על אלמנט כדי לבחור',
                reset: 'איפוס הגדרות',
            },
            SimpleList: {
                primaryText: 'טקסט ראשי',
                secondaryText: 'טקסט משני',
                tertiaryText: 'טקסט שלישי',
            },
        },
    },
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
        }
    }
}

const translations = { en, he: deepMerge(he, domainTranslation) };

const i18nProvider = polyglotI18nProvider(
    locale => translations[locale],
    'en', // default locale
    [{ locale: 'en', name: 'English' }, { locale: 'he', name: 'עברית' }],
);

export default i18nProvider;