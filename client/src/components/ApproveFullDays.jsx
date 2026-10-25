import {
    useDataProvider,
    useNotify,
    useRefresh,
    SimpleForm,
    TextInput,
    DateInput,
    required,
    maxLength,
} from 'react-admin';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { defaultYearFilter } from '@shared/utils/yearFilter';

export const ApproveFullDays = ({ label }) => {
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const notify = useNotify();

    const handleSave = async (values, onClose) => {
        const row = {
            studentReferenceId: values.studentReferenceId,
            klassReferenceId: values.klassReferenceId,
            fromDate: values.fromDate,
            toDate: values.toDate,
        };
        try {
            const response = await dataProvider.action(
                'known_absence',
                'approveByStudentDates',
                {},
                { rows: [row], reason: values.reason, senderName: values.senderName, comment: values.comment },
            );
            handleActionSuccess(notify)(response);
            refresh();
            onClose?.();
        } catch (err) {
            handleError(notify)(err);
        }
    };

    return (
        <ActionOrDialogButton
            label={label}
            name="approveFullDays"
            title="אישור ימים מלאים לתלמידה"
            dialogContent={({ onClose }) => (
                <SimpleForm onSubmit={(values) => handleSave(values, onClose)}>
                    <CommonReferenceInput
                        source="studentReferenceId"
                        reference="student_by_year"
                        validate={required()}
                        label="תלמידה"
                        filter={defaultYearFilter}
                    />
                    <DateInput source="fromDate" validate={required()} label="מתאריך" />
                    <DateInput source="toDate" label="עד תאריך" helperText="ריק = יום אחד" />
                    <CommonReferenceInput
                        source="klassReferenceId"
                        reference="klass"
                        dynamicFilter={filterByUserIdAndYear}
                        label="כיתה (לא חובה)"
                    />
                    <TextInput source="reason" validate={maxLength(500)} label="סיבה" />
                    <TextInput source="senderName" validate={maxLength(100)} label="שולחת" />
                    <TextInput source="comment" validate={maxLength(500)} label="הערה" />
                </SimpleForm>
            )}
        />
    );
};
