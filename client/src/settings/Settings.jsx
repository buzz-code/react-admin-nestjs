import { Card, CardContent } from '@mui/material';
import {
    SimpleForm,
    Title,
    useNotify,
    useGetIdentity,
    useDataProvider,
    SaveButton,
    Toolbar,
    useAuthProvider,
    ResourceContextProvider,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize } from '@shared/utils/settingsUtil';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import { DashboardItemsInput } from '@shared/components/settings/DashboardItemsInput';
import { getLateValue, getLessonTimes, getDashboardItems, getReportStyles, getReportCardSettings, normalizeReportStyles } from './settingsUtil';
import { ReportStylesInput } from './ReportStylesInput';
import { GeneralSettingsInput } from './GeneralSettingsInput';
import { MailSettingsInput } from './MailSettingsInput';
import { ReportCardSettingsInput } from './ReportCardSettingsInput';
import { YemotSettingsInput } from '@shared/components/phone/YemotSettingsInput';
import { PhoneSettingsInput } from '@shared/components/phone/PhoneSettingsInput';
import { ManagerPhoneSettingsInput } from './ManagerPhoneSettingsInput';

const SettingsToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

export default function Settings() {
    const notify = useNotify();
    const navigate = useNavigate();
    const { identity } = useGetIdentity();
    const dataProvider = useDataProvider();
    const authProvider = useAuthProvider();

    const defaultValues = {
        defaultPageSize: getDefaultPageSize(identity),
        lateValue: getLateValue(identity),
        lessonTimes: getLessonTimes(identity),
        dashboardItems: getDashboardItems(identity),
        reportStyles: normalizeReportStyles(getReportStyles(identity)),
        reportCardSettings: getReportCardSettings(identity),
        phoneNumber: identity?.phoneNumber ?? '',
        mailAddressTitle: identity?.mailAddressTitle ?? '',
        mailAddressAlias: identity?.mailAddressAlias ?? '',
    };

    const handleSave = async ({ phoneNumber, mailAddressTitle, mailAddressAlias, ...values }) => {
        try {
            const profile = Object.fromEntries(
                Object.entries({ phoneNumber, mailAddressTitle, mailAddressAlias })
                    .filter(([key, value]) => value !== (identity?.[key] ?? ''))
            );
            if (Object.keys(profile).length) {
                await dataProvider.updateProfile({ data: profile });
            }
            await dataProvider.updateSettings({ data: values });
            await authProvider.getIdentity(true);
            notify('ההגדרות נשמרו בהצלחה', { type: 'info' });
            navigate('/');
            window.location.reload();
        } catch (e) {
            notify(e?.status === 400 && e?.message ? e.message : 'שמירה נכשלה', { type: 'error' });
        }
    };

    return (
        <Card>
            <Title title="הגדרות" />
            <CardContent>
                <ResourceContextProvider value="settings">
                    <SimpleForm onSubmit={handleSave} defaultValues={defaultValues} toolbar={<SettingsToolbar />}>
                        <GeneralSettingsInput />
                        <MailSettingsInput />
                        <ReportStylesInput />
                        <ReportCardSettingsInput />
                        <CommonSettingsAccordion
                            id="phone-settings-group"
                            title="הגדרות טלפון"
                            subtitle="מספר טלפון, חיבור Yemot וטלפון מנהלת"
                        >
                            <PhoneSettingsInput />
                            <YemotSettingsInput />
                            <ManagerPhoneSettingsInput />
                        </CommonSettingsAccordion>
                        <CommonSettingsAccordion
                            id="advanced-settings"
                            title="הגדרות מתקדמות"
                            subtitle="ניהול כרטיסי תמונת מצב"
                        >
                            <DashboardItemsInput />
                        </CommonSettingsAccordion>
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}
