import { useDataProvider, useNotify, useResourceContext, useRefresh, SimpleForm, TextInput, NumberInput, BooleanInput, DateInput, required, maxLength, ArrayInput, SimpleFormIterator } from 'react-admin';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { useIsApprovedAbsencesBulk } from 'src/utils/appPermissions';
import { defaultYearFilter } from '@shared/utils/yearFilter';

export const BulkApproveAbsences = ({ label, name }) => {
    const dataProvider = useDataProvider();
    const resource = useResourceContext();
    const refresh = useRefresh();
    const notify = useNotify();
    const canBulkApproveAbsences = useIsApprovedAbsencesBulk();
    if (!canBulkApproveAbsences) return null;
    
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
        <ActionOrDialogButton label={label} name="approvedAbsences" title="אישור חיסורים מרוכז" dialogContent={({ onClose }) => (
            <SimpleForm defaultValues={{approvedAbsences:[{absnceCount: 1}]}} onSubmit={values => handleSave(values, onClose)}>
                <CommonReferenceInput source="studentReferenceId" reference="student_by_year" validate={required()} label="תלמידה" filter={defaultYearFilter} />
                <DateInput source="reportDate" validate={required()} label="תאריך" />
                <NumberInput source="absnceCode" label="קוד חיסור" />
                <TextInput source="senderName" validate={maxLength(500)} label="שולחת" />
                <TextInput source="reason" validate={maxLength(500)} label="סיבה" />
                <TextInput source="comment" validate={maxLength(500)} label="הערה" />
                <BooleanInput source="isApproved" defaultValue label="מאושר" />
                <ArrayInput source="approvedAbsences" label="חיסורים לאישור">
                    <SimpleFormIterator>
                        <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} label="כיתה" />
                        <CommonReferenceInput source="lessonReferenceId" reference="lesson" label="שיעור" />
                        <NumberInput source="absnceCount" validate={required()} label="מספר חיסורים"/>
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        )} />
    );
};
