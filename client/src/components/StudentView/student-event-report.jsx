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
    useGetList,
    Create,
    SimpleForm,
    FormDataConsumer,
    Loading,
    ArrayInput,
    SimpleFormIterator
} from 'react-admin';
import { filterByUserIdAndYear } from '@shared/components/fields/CommonReferenceInputFilter';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { defaultYearFilter, yearChoices } from '@shared/utils/yearFilter';
import CommonAutocompleteInput from '@shared/components/fields/CommonAutocompleteInput';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';
import SignatureInput from '@shared/components/fields/signature/SignatureInput';
import { useObjectStore } from "src/utils/storeUtil";

const DynamicFields = ({ absenceType, isLoading }) => {
    if (isLoading) return <Loading loadingPrimary="טוען שדות..." />;
    if (!absenceType?.requiredLabels?.length) return null;
    return (
        <div style={{ padding: '10px 0', width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {absenceType.requiredLabels.map((label) => (
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

const extractBasePayload = (rootValues, reportValues, userId, studentId, absenceType) => {
    const allowedLabels = absenceType?.requiredLabels || [];
    const extraInfo = Object.keys(rootValues)
        .filter(key => key.startsWith('dynamic_') && allowedLabels.includes(key.replace('dynamic_', '')) && rootValues[key])
        .map(key => `${key.replace('dynamic_', '')}: ${rootValues[key]}`)
        .join(' | ');

    return {
        userId: userId,
        studentReferenceId: studentId,
        year: defaultYearFilter.year,
        reportDate: reportValues.reportDate,
        isApproved: true,
        reason: extraInfo || "",
        absenceTypeId: rootValues.absenceTypeId
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

    const { data: existingAbsences } = useGetList(
        'known_absence',
        {
            pagination: { page: 1, perPage: 1000 },
            filter: {
                studentReferenceId: student?.id,
                absenceTypeId: selectedAbsenceTypeId,
                year: defaultYearFilter.year
            }
        },
        { enabled: !!selectedAbsenceTypeId && !!student?.id }
    );

    const uniqueDates = React.useMemo(() => {
        const datesSet = new Set();
        existingAbsences?.forEach(item => {
            datesSet.add(new Date(item.reportDate).toISOString().split('T')[0]);
        });

        return datesSet;
    }, [existingAbsences]);
    const utilizedDays = uniqueDates.size;

    const handleSave = async (values) => {
        try {
            const reports = values.reports || [];
            if (reports.length === 0) {
                notify("יש להזין לפחות דיווח אחד", { type: 'warning' });
                return;
            }

            const quota = absenceType?.quota;
            if (quota) {
                const newDates = new Set(uniqueDates);
                reports.forEach(report => {
                    if (report.reportDate) {
                        newDates.add(new Date(report.reportDate).toISOString().split('T')[0]);
                    }
                });

                if (newDates.size > quota) {
                    notify(
                        `חריגה מהמכסה! המכסה היא ${quota} ימים. עם הדיווחים החדשים את מנסה לנצל ${newDates.size} ימים שונים.`,
                        { type: 'error', autoHideDuration: 10000 }
                    );
                    return;
                }
            }

            let payloadsToCreate = [];

            const addPayloadIfValid = (base, klassId, count) => {
                const parsedCount = parseFloat(count);
                if (klassId && parsedCount > 0) {
                    payloadsToCreate.push({
                        ...base,
                        klassReferenceId: klassId,
                        absnceCount: parsedCount
                    });
                }
            };

            reports.forEach(report => {
                const basePayload = extractBasePayload(values, report, student.userId, student.id, absenceType);

                addPayloadIfValid(basePayload, report.homeroomKlassId, report.homeroomAbsnceCount);
                addPayloadIfValid(basePayload, report.specializationKlassId, report.specializationAbsnceCount);
                addPayloadIfValid(basePayload, report.extraKlassId, report.extraAbsnceCount);
            });

            if (payloadsToCreate.length === 0) {
                notify("יש להזין שעות היעדרות לפחות עבור כיתה אחת באחד הדיווחים", { type: 'warning' });
                return;
            }

            const response = await dataProvider.createMany('known_absence', payloadsToCreate);
            handleActionSuccess(notify)(response);
            clear();
            reset();
        } catch (error) {
            handleError(notify)(error);
        }
    };

    return (
        <Create resource="known_absence" {...props} title="הוספת דיווח אירוע">
            <SimpleForm onSubmit={handleSave} sanitizeEmptyValues defaultValues={{ reports: [{}] }}>
                <CommonReferenceInput source="absenceTypeId" reference="absence_type" dynamicFilter={filterByUserIdAndYear} validate={required()} onChange={(e) => setSelectedAbsenceTypeId(e?.target?.value ?? e)} />
                {absenceType?.quota !== undefined && (
                    <div style={{ backgroundColor: '#f0f8ff', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#005b9f' }}>
                        <strong>שימי לב:</strong> המכסה השנתית לאירוע זה היא {absenceType.quota} ימים. עד כה ניצלת {utilizedDays} ימים. באפשרותך לדווח על {Math.max(0, absenceType.quota - utilizedDays)} ימים במקביל. מלאי את השדות הנדרשים מטה.
                    </div>
                )}
                <DynamicFields absenceType={absenceType} isLoading={isLoading} />

                <ArrayInput source="reports" label="פירוט היעדרויות">
                    <SimpleFormIterator disableReordering>
                        <DateInput source="reportDate" label="תאריך החיסור" validate={required()} />

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <CommonReferenceInput source="homeroomKlassId" label="כיתת אם" reference="klass" validate={required()} dynamicFilter={filterByUserIdAndYear} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <NumberInput source="homeroomAbsnceCount" label="שעות היעדרות" validate={required()} defaultValue={0} min={0} step={1} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <CommonReferenceInput source="specializationKlassId" label="כיתת התמחות (אופציונלי)" reference="klass" dynamicFilter={filterByUserIdAndYear} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <NumberInput source="specializationAbsnceCount" label="שעות היעדרות" defaultValue={0} min={0} step={1} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <CommonReferenceInput source="extraKlassId" label="כיתת התמחות 2 (אופציונלי)" reference="klass" dynamicFilter={filterByUserIdAndYear} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <NumberInput source="extraAbsnceCount" label="שעות היעדרות" defaultValue={0} min={0} step={1} />
                            </div>
                        </div>
                    </SimpleFormIterator>
                </ArrayInput>

                <CommonAutocompleteInput source="year" choices={yearChoices} defaultValue={defaultYearFilter.year} disabled />
                <BooleanInput source="isApproved" defaultValue={true} disabled />
                <SignatureInput source="signatureData" validate={[required()]} label='אני מאשרת כי המידע המוצג בדו"ח זה אמין ומדויק, וכי סיבת ההיעדרות המצוינת היא הסיבה בפועל.' />
            </SimpleForm>
        </Create>
    );
};

export default StudentEventReport;