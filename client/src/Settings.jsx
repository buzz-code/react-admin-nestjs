import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider, NumberInput } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize, getLateValue } from '@shared/utils/settingsUtil';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';

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
                <SimpleForm
                    onSubmit={handleSave}
                    defaultValues={defaultValues}
                    toolbar={<SettingsToolbar />}
                >
                    <CommonAutocompleteInput
                        source="defaultPageSize"
                        label="מספר שורות בטבלה"
                        choices={pageSizeOptions}
                        fullWidth
                        disableClearable
                    />
                    <NumberInput source="lateValue" label="שווי איחור" fullWidth />
                </SimpleForm>
            </CardContent>
        </Card>
    );
}