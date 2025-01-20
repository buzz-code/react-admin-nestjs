import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { SimpleForm, Title, useNotify, useGetIdentity, useDataProvider, SaveButton, Toolbar, useAuthProvider, NumberInput, ArrayInput, SimpleFormIterator, ResourceContextProvider } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { getDefaultPageSize, getLateValue, getDashboardItems } from '@shared/utils/settingsUtil';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { PAGE_SIZE_OPTIONS } from '@shared/config/settings';
import { CommonEntityNameInput } from '@shared/components/fields/CommonEntityNameInput';
import { CommonJsonInput } from '@shared/components/fields/CommonJsonItem';

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
                        />
                        <NumberInput source="lateValue" fullWidth />

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            הגדרות לוח מחוונים
                        </Typography>
                        <ArrayInput source="dashboardItems">
                            <SimpleFormIterator>
                                <CommonEntityNameInput
                                    source="resource"
                                    helperText="בחר את מקור הנתונים שברצונך להציג"
                                    fullWidth
                                />
                                <CommonAutocompleteInput
                                    source="yearFilterType"
                                    choices={[
                                        { id: 'none', name: 'ללא סינון שנה' },
                                        { id: 'year', name: 'סינון שנה רגיל' },
                                        { id: 'year:$cont', name: 'סינון שנה מורחב' }
                                    ]}
                                    defaultValue="year"
                                    fullWidth
                                    disableClearable
                                />
                                <CommonJsonInput source="filter" />
                            </SimpleFormIterator>
                        </ArrayInput>
                    </SimpleForm>
                </ResourceContextProvider>
            </CardContent>
        </Card>
    );
}