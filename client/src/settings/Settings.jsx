import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider, NumberInput, ResourceContextProvider, required } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize, getLateValue, getDashboardItems } from '@shared/utils/settingsUtil';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';
import { DashboardItemsInput } from './DashboardItemsInput';

const pageSizeOptions = PAGE_SIZE_OPTIONS.map(option => ({ id: option, name: option }));

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
    };

    const handleSave = async (values) => {
        try {
            await dataProvider.updateSettings({ data: values });
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
                    <SimpleForm
                        onSubmit={handleSave}
                        defaultValues={defaultValues}
                        toolbar={<SettingsToolbar />}
                    >
                        <CommonAutocompleteInput
                            source="defaultPageSize"
                            choices={pageSizeOptions}
                            fullWidth
                            disableClearable
                            validate={required()}
                        />
                        <NumberInput source="lateValue" fullWidth validate={required()} />

                        <DashboardItemsInput />
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}