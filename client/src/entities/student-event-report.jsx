import React from 'react';
import {
    TextInput,
    NumberInput,
    DateInput,
    BooleanInput,
    required,
    useNotify,
    useRedirect,
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


const DynamicFields = ({ absenceTypeId }) => {
    const { data, isLoading } = useGetOne(
        'absence_type',
        { id: absenceTypeId },
        { enabled: !!absenceTypeId }
    );

    if (isLoading) return <Loading loadingPrimary="טוען שדות..." />;
    if (!data?.requiredLabels?.length) return null;

    return (
        <div style={{ padding: '10px 0', width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {data.requiredLabels.map((label, index) => (
                <TextInput
                    key={`${absenceTypeId}-${label}`}
                    source={`dynamic_${label}`}
                    label={label}
                    validate={required()}
                    style={{ flex: 1, minWidth: '200px' }}
                />
            ))}
        </div>
    );
};

const formatPayload = (values) => {
    const extraInfo = Object.keys(values)
        .filter(key => key.startsWith('dynamic_') && values[key])
        .map(key => {
            const label = key.replace('dynamic_', '');
            return `${label}: ${values[key]}`;
        })
        .join(' | ');

    const { ...cleanValues } = values;
    Object.keys(cleanValues).forEach(key => {
        if (key.startsWith('dynamic_')) delete cleanValues[key];
    });

    return {
        ...cleanValues,
        userId: cleanValues.userId,
        year: parseInt(cleanValues.year),
        reportDate: cleanValues.reportDate ? new Date(cleanValues.reportDate).toISOString() : new Date().toISOString(),
        absnceCount: parseFloat(cleanValues.absnceCount) || 1,
        absnceCode: 0,
        klassId: 0,
        lessonId: 0,
        isApproved: true,
        reason: cleanValues.reason ? `${cleanValues.reason} [${extraInfo}]` : extraInfo,
    };
};

const StudentEventReportCreate = (props) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    const handleSave = async (values) => {
        try {
            const { data: absenceType } = await dataProvider.getOne('absence_type', {
                id: values.absenceTypeId
            });

            const quota = absenceType?.quota;

            if (quota !== undefined && quota !== null) {
                const { data: existingAbsences } = await dataProvider.getList('known_absence', {
                    pagination: { page: 1, perPage: 1000 },
                    filter: {
                        studentReferenceId: values.studentReferenceId,
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

            const formattedData = formatPayload(values);
            const response = await dataProvider.create('known_absence', { data: formattedData });
            handleActionSuccess(notify)(response);
            redirect('/known_absence');

        } catch (error) {
            handleError(notify)(err);
        }
    };

    return (
        <Create {...props} title="הוספת דיווח אירוע">
            <SimpleForm onSubmit={handleSave} sanitizeEmptyValues>
                <CommonReferenceInput source="userId" reference="user" validate={required()} />

                <CommonReferenceInput
                    source="studentReferenceId"
                    reference="student_by_year"
                    validate={required()}
                    dynamicFilter={filterByUserIdAndYear}
                />

                <CommonReferenceInput
                    source="klassReferenceId"
                    reference="klass"
                    validate={required()}
                    dynamicFilter={filterByUserIdAndYear}

                />

                <CommonReferenceInput
                    source="absenceTypeId"
                    reference="absence_type"
                    dynamicFilter={filterByUserIdAndYear}
                    validate={required()}
                />
                <FormDataConsumer>
                    {({ formData }) => (
                        <DynamicFields absenceTypeId={formData.absenceTypeId} />
                    )}
                </FormDataConsumer>

                <DateInput source="reportDate" validate={required()} defaultValue={new Date()} />
                <NumberInput source="absnceCount" defaultValue={1} min={0} step={0.5} />
                <TextInput source="senderName" />
                <TextInput source="reason" multiline fullWidth />
                <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} />
                <BooleanInput source="isApproved" defaultValue={true} disabled />
            </SimpleForm>
        </Create>
    );
};

export default {
    create: StudentEventReportCreate,
    list: StudentEventReportCreate,
};