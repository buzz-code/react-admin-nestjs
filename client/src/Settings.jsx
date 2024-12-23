import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, TextInput, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize } from '@shared/utils/settingsUtil';

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
                    <TextInput
                        source="defaultPageSize"
                        label="מספר שורות בטבלה"
                        fullWidth
                    />
                </SimpleForm>
            </CardContent>
        </Card>
    );
}