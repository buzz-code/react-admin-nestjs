import React, { useState ,useCallback} from 'react';
import {useDataProvider, useNotify,useResourceContext,useRefresh,SaveButton,SimpleForm,TextInput,NumberInput,BooleanInput,DateInput,required,maxLength,} from 'react-admin';
import { SaveContextProvider } from 'ra-core';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ActionOrDialogButton } from '@shared/components/crudContainers/ActionOrDialogButton';
import CommonReferenceInput from '@shared/components/fields/CommonReferenceInput';
import { handleError } from '@shared/utils/notifyUtil';

const createEmptyRow = () => ({
    id: crypto.randomUUID(),
    klassReferenceId: '',
    lessonReferenceId: '',
    absnceCount: 1,
    errors: {},
});

export const ActionButton = ({ label }) => {
    const dataProvider = useDataProvider();
    const resource = useResourceContext();
    const refresh = useRefresh();
    const notify = useNotify();

    const [studentReferenceId, setStudentReferenceId] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [absnceCode, setAbsenceCode] = useState('');
    const [senderName, setSenderName] = useState('');
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [isApproved, setIsApproved] = useState(true);

    const [rows, setRows] = useState([createEmptyRow()]);

    const validateRow = row => {
        const errors = {};
        if (!row.klassReferenceId) errors.klassReferenceId = true;
        if (!row.absnceCount || row.absnceCount <= 0)
            errors.absnceCount = true;
        return errors;
    };

    const updateRow = (id, field, value) =>
        setRows(prev =>
            prev.map(row => {
                if (row.id !== id) return row;
                const updated = { ...row, [field]: value };
                return { ...updated, errors: validateRow(updated) };
            })
        );

    const addRow = () => setRows(prev => [...prev, createEmptyRow()]);

    const removeRow = id => {
        if (rows.length === 1) {
            notify('לא ניתן למחוק את השורה האחרונה', { type: 'warning' });
            return;
        }
        setRows(prev => prev.filter(row => row.id !== id));
    };


    const handleSave = useCallback(
        async (onClose) => {
            const validatedRows = rows.map(row => ({
                ...row,
                errors: validateRow(row),
            }));
            setRows(validatedRows);
    
            const hasRowErrors = validatedRows.some(
                row => Object.keys(row.errors).length > 0
            );
    
            if (!studentReferenceId || !reportDate || hasRowErrors) {
                notify('נא למלא את כל שדות החובה', { type: 'warning' });
                return;
            }
    
            const payload = validatedRows.map(row => ({
                studentReferenceId,
                reportDate,
                absnceCode: absnceCode || null,
                senderName: senderName || null,
                reason: reason || null,
                comment: comment || null,
                isApproved,
                klassReferenceId: row.klassReferenceId,
                lessonReferenceId: row.lessonReferenceId || null,
                absnceCount: row.absnceCount,
            }));
    
            try {
                await dataProvider.createMany(resource, payload);
                refresh();
                notify('הפריט נוסף בהצלחה', { type: 'success' });
                onClose(); 
            } catch (err) {
                notify('אירעה שגיאה', { type: 'error' });
                handleError(err);
            }
        },
        [rows,studentReferenceId,reportDate,absnceCode,senderName,reason,comment,isApproved,dataProvider, resource, refresh, notify, ]
    );
    


    return (
        <ActionOrDialogButton
            label={label}
            name="approvedAbsences"
            dialogContent={({ onClose }) => (
                <SimpleForm save={null} toolbar={null}>
                    <CommonReferenceInput source="studentReferenceId" reference="student_by_year" value={studentReferenceId} onChange={setStudentReferenceId} validate={required()} label="תלמידה"/>
                    <DateInput source="reportDate" value={reportDate} onChange={e => setReportDate(e?.target?.value ?? e)} validate={required()} label="תאריך"/>
                    <NumberInput source="absnceCode" value={absnceCode} onChange={e => setAbsenceCode(e?.target?.value ?? e)}label="קוד חיסור" />
                    <TextInput source="senderName" value={senderName}  onChange={e => setSenderName(e?.target?.value ?? e)} validate={maxLength(500)} label="שולחת"/>
                    <TextInput source="reason" value={reason} onChange={e => setReason(e?.target?.value ?? e)} validate={maxLength(500)} label="סיבה"/>
                    <TextInput source="comment" value={comment} onChange={e => setComment(e?.target?.value ?? e)} validate={maxLength(500)} label="הערה"/>
                    <BooleanInput source="isApproved" checked={isApproved} onChange={e => setIsApproved(e.target.checked)} label="מאושר"/>

                    <hr style={{ margin: '16px 0' }} />

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>כיתה *</TableCell>
                                <TableCell>שיעור</TableCell>
                                <TableCell>מספר חיסורים *</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <CommonReferenceInput
                                            source={`klass-${row.id}`}
                                            reference="klass"
                                            value={row.klassReferenceId}
                                            onChange={v =>
                                                updateRow(
                                                    row.id,
                                                    'klassReferenceId',
                                                    v?.target?.value ?? v
                                                )
                                            }
                                            error={!!row.errors.klassReferenceId}
                                            helperText={
                                                row.errors.klassReferenceId
                                                    ? 'שדה חובה'
                                                    : ''
                                            }
                                            label={false}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <CommonReferenceInput
                                            source={`lesson-${row.id}`}
                                            reference="lesson"
                                            value={row.lessonReferenceId}
                                            onChange={v =>
                                                updateRow(
                                                    row.id,
                                                    'lessonReferenceId',
                                                    v?.target?.value ?? v
                                                )
                                            }
                                            label={false}

                                        />
                                    </TableCell>

                                    <TableCell>
                                        <NumberInput
                                            source={`count-${row.id}`}
                                            value={row.absnceCount}
                                            onChange={e =>
                                                updateRow(
                                                    row.id,
                                                    'absnceCount',
                                                    Number(
                                                        e?.target?.value ?? e
                                                    )
                                                )
                                            }
                                            error={!!row.errors.absnceCount}
                                            helperText={
                                                row.errors.absnceCount
                                                    ? 'חייב להיות גדול מ־0'
                                                    : ''
                                            }
                                            label={false}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            disabled={rows.length === 1}
                                            onClick={() => removeRow(row.id)}
                                        >
                                            מחק
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Button variant="contained"color="primary" onClick={addRow}  sx={{ mt: 1 }}>
                        הוסף שורה
                    </Button>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SaveContextProvider value={{ save: () => handleSave(onClose) }}>
                             <SaveButton type="button" label="אישור" alwaysEnable />
                    </SaveContextProvider>

                   </div>
                </SimpleForm>
            )}
        />
    );
};
