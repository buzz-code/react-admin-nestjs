import React from 'react';
import {
    TextInput,
    NumberInput,
    DateInput,
    BooleanInput,
    required,
    useNotify,
    useResetStore,
    useDataProvider,
    useGetOne,
    Create,
    SimpleForm,
    FormDataConsumer,
    Loading,
} from 'react-admin';
import { filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import { useObjectStore } from "src/utils/storeUtil";

const DynamicFields = ({ absenceType, isLoading }) => {

    if (isLoading) return <Loading loadingPrimary="טוען שדות..." />;
    if (!absenceType?.requiredLabels?.length) return null;
    return (
        <div style={{ padding: '10px 0', width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {absenceType.requiredLabels.map((label, index) => (
                <TextInput
                    key={`${absenceType.id}-${label}`}
                    source={`dynamic_${label}`}
                    label={label}
                    validate={required()}
                    style={{ flex: 1, minWidth: '200px' }}
                />
            ))}
        </div>
    );
};

const formatPayload = (values, userId, studentId, absenceType) => {
    const allowedLabels = absenceType?.requiredLabels || [];

    const extraInfo = Object.keys(values)
        .filter(key => {
            if (!key.startsWith('dynamic_')) return false;
            const label = key.replace('dynamic_', '');
            return allowedLabels.includes(label) && values[key];
        })
        .map(key => {
            const label = key.replace('dynamic_', '');
            return `${label}: ${values[key]}`;
        })
        .join(' | ');

    const cleanValues = { ...values };
    Object.keys(cleanValues).forEach(key => {
        if (key.startsWith('dynamic_')) delete cleanValues[key];
    });

    return {
        ...cleanValues,
        userId: userId,
        studentReferenceId: studentId,
        year: parseInt(defaultYearFilter.year),
        reportDate: cleanValues.reportDate ? new Date(cleanValues.reportDate).toISOString() : new Date().toISOString(),
        absnceCount: parseFloat(cleanValues.absnceCount) || 1,
        isApproved: true,
        reason: cleanValues.reason ? `${cleanValues.reason} [${extraInfo}]` : extraInfo,
    };
};

const StudentEventReport = (props) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const reset = useResetStore();
    const { value: student, clear } = useObjectStore("student");
    const [selectedAbsenceTypeId, setSelectedAbsenceTypeId] = React.useState(null);
    const { data: absenceType, isLoading } = useGetOne(
        'absence_type',
        { id: selectedAbsenceTypeId },
        { enabled: !!selectedAbsenceTypeId }
    );

    const handleSave = async (values) => {
        try {
            const quota = absenceType?.quota;

            if (quota) {
                const { data: existingAbsences } = await dataProvider.getList('known_absence', {
                    pagination: { page: 1, perPage: 1000 },
                    filter: {
                        studentReferenceId: student.id,
                        absenceTypeId: values.absenceTypeId,
                        year: values.year
                    },
                });

                const currentTotal = existingAbsences.reduce((sum, item) => sum + (parseFloat(item.absnceCount) || 0), 0);
                const requestedAmount = parseFloat(values.absnceCount || 1);

                if (currentTotal + requestedAmount > quota) {
                    notify(
                        `חריגה מהמכסה! המכסה היא ${quota}. נוצלו ${currentTotal}, ניסיון להוסיף ${requestedAmount}.`,
                        { type: 'error', autoHideDuration: 10000 }
                    );
                    return;
                }
            }

            const formattedData = formatPayload(values, student.userId, student.id, absenceType)
            const response = await dataProvider.create('known_absence', { data: formattedData });
            handleActionSuccess(notify)(response);
            clear();
            reset();
        } catch (error) {
            handleError(notify)(error);
        }
    };

    return (
        <Create resource="known_absence" {...props} {...props} title="הוספת דיווח אירוע">
            <SimpleForm onSubmit={handleSave} sanitizeEmptyValues>
                <CommonReferenceInput source="klassReferenceId" reference="klass" validate={required()} dynamicFilter={filterByUserIdAndYear} />
                <CommonReferenceInput source="absenceTypeId" reference="absence_type" dynamicFilter={filterByUserIdAndYear} validate={required()}
                    onChange={(e) => { const value = e?.target ? e.target.value : e; setSelectedAbsenceTypeId(value); }} />
                <FormDataConsumer>
                    {() => (
                        <DynamicFields absenceType={absenceType} isLoading={isLoading} />
                    )}
                </FormDataConsumer>
                <DateInput source="reportDate" validate={required()} defaultValue={new Date()} />
                <NumberInput source="absnceCount" defaultValue={1} min={0} step={0.5} />
                <TextInput source="senderName" />
                <TextInput source="reason" multiline fullWidth />
                <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} disabled />
                <BooleanInput source="isApproved" defaultValue={true} disabled />
            </SimpleForm>
        </Create>
    );
};

export default StudentEventReport;