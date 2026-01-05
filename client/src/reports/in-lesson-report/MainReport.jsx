import React from 'react';
import { FormDataConsumer, SimpleForm, NumberInput, RecordContextProvider, useStore } from 'react-admin';
import Divider from '@mui/material/Divider';
import { ReportHeader } from './ReportHeader';
import { getDefaultReportDate, StudentList } from './StudentList';
import LessonSignatureFields from '../../components/LessonSignatureFields';
import { FormActions } from './FormActions';
import { AutoPersistInStore } from '@shared/components/form/AutoPersistInStore';

export const MainReport = ({ gradeMode, handleSave, storePrefix }) => {
    const [reportDates, setReportDates] = useStore(`${storePrefix}.reportDates`, [getDefaultReportDate()]);

    return (
        <>
            <ReportHeader />
            <SimpleForm toolbar={null} onSubmit={handleSave}>
                <AutoPersistInStore storeKey={`${storePrefix}.form`} />
                <FormDataConsumer>
                    {({ formData }) => (
                        <RecordContextProvider value={formData}>
                            {!gradeMode && (
                                <NumberInput
                                    source="howManyLessons"
                                    label="מספר שיעורים"
                                    defaultValue={1}
                                    fullWidth
                                />
                            )}
                            <Divider />
                            <StudentList
                                reportDates={reportDates}
                                setReportDates={setReportDates}
                            />
                            <LessonSignatureFields />
                            <FormActions />
                        </RecordContextProvider>
                    )}
                </FormDataConsumer>
            </SimpleForm>
        </>
    );
};