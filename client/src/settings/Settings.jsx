import React from 'react';
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
import { getLateValue, getDashboardItems, getReportStyles, getReportCardSettings, normalizeReportStyles } from './settingsUtil';
import { ReportStylesInput } from './ReportStylesInput';
import { GeneralSettingsInput } from './GeneralSettingsInput';
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
        dashboardItems: getDashboardItems(identity),
        reportStyles: normalizeReportStyles(getReportStyles(identity)),
        reportCardSettings: getReportCardSettings(identity),
        phoneNumber: identity?.phoneNumber ?? '',
    };

    const handleSave = async ({ phoneNumber, ...values }) => {
        try {
            await dataProvider.updateSettings({ data: values });
            if (phoneNumber !== (identity?.phoneNumber ?? '')) {
                await dataProvider.updateProfile({ data: { phoneNumber } });
            }
            await authProvider.getIdentity(true);
            notify('ההגדרות נשמרו בהצלחה', { type: 'info' });
            navigate('/');
            window.location.reload();
        } catch (e) {
            notify('שמירה נכשלה', { type: 'error' });
        }
    };

    return (
        <Card>
            <Title title="הגדרות" />
            <CardContent>
                <ResourceContextProvider value="settings">
                    <SimpleForm onSubmit={handleSave} defaultValues={defaultValues} toolbar={<SettingsToolbar />}>
                        <GeneralSettingsInput />
                        <PhoneSettingsInput />
                        <ReportStylesInput />
                        <ReportCardSettingsInput />
                        <CommonSettingsAccordion
                            id="advanced-settings"
                            title="הגדרות מתקדמות"
                            subtitle="ניהול כרטיסי תמונת מצב וחיבור Yemot"
                        >
                            <DashboardItemsInput />
                            <YemotSettingsInput />
                            <ManagerPhoneSettingsInput />
                        </CommonSettingsAccordion>
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}
