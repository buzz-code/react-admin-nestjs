import React from 'react';
import { Card, CardContent } from '@mui/material';
import { SimpleForm, TextInput, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar } from 'react-admin';

const SettingsToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

export default function Settings() {
    const notify = useNotify();
    const { identity } = useGetIdentity();
    const dataProvider = useDataProvider();

    const defaultValues = {
        defaultPageSize: identity?.additionalData?.defaultPageSize || '',
    };

    const handleSave = async (values) => {
        try {
            await dataProvider.updateSettings({ data: values });
            notify('ההגדרות נשמרו בהצלחה', { type: 'info' });
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
                        label="גודל עמוד ברירת מחדל"
                        fullWidth
                    />
                </SimpleForm>
            </CardContent>
        </Card>
    );
}