import { useDataProvider, useNotify, useResourceContext, useRefresh, SimpleForm, TextInput, NumberInput, BooleanInput, DateInput, required, maxLength, ArrayInput, SimpleFormIterator } from 'react-admin';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { isApprovedAbsencesBulk } from 'src/utils/appPermissions';

export const BulkApproveAbsences = ({ label, name, permissions }) => {
    const dataProvider = useDataProvider();
    const resource = useResourceContext();
    const refresh = useRefresh();
    const notify = useNotify();
    if (!isApprovedAbsencesBulk(permissions)) return null;
    
    const handleSave = async (values, onClose) => {
        const payload = values.approvedAbsences.map(row => ({
            studentReferenceId: values.studentReferenceId,
            reportDate: values.reportDate,
            absnceCode: values.absnceCode || null,
            senderName: values.senderName || null,
            reason: values.reason || null,
            comment: values.comment || null,
            isApproved: values.isApproved,
            klassReferenceId: row.klassReferenceId,
            lessonReferenceId: row.lessonReferenceId || null,
            absnceCount: row.absnceCount,
        }));
        try {
            const response = await dataProvider.createMany(resource, payload);
                handleActionSuccess(notify)(response);
                refresh();
                onClose?.();
        }
        catch (err) {
            handleError(notify)(err);
        }
    };

    return (
        <ActionOrDialogButton label={label} name="approvedAbsences" dialogContent={({ onClose }) => (
            <SimpleForm onSubmit={values => handleSave(values, onClose)}>
                <CommonReferenceInput source="studentReferenceId" reference="student_by_year" validate={required()} label="תלמידה" />
                <DateInput source="reportDate" validate={required()} label="תאריך" />
                <NumberInput source="absnceCode" label="קוד חיסור" />
                <TextInput source="senderName" validate={maxLength(500)} label="שולחת" />
                <TextInput source="reason" validate={maxLength(500)} label="סיבה" />
                <TextInput source="comment" validate={maxLength(500)} label="הערה" />
                <BooleanInput source="isApproved" defaultValue label="מאושר" />
                <ArrayInput source="approvedAbsences" initialValues={[{ absnceCount: 1 }]} label="חיסורים לאישור">
                    <SimpleFormIterator>
                        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} label="כיתה" />
                        <CommonReferenceInput source="lessonReferenceId" reference="lesson" label="שיעור" />
                        <NumberInput source="absnceCount" validate={required()} label="מספר חיסורים" defaultValue={1} />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        )} />
    );
};
