import { useInput, FieldTitle, InputHelperText, useResourceContext } from 'react-admin';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useAbsenceReasons } from 'src/settings/settingsUtil';

// Pick a reason from the user's settings list, or type any other text. Saves plain text either way.
export const AbsenceReasonAutocomplete = ({ value, onChange, label, helperText, error, onBlur, ...props }) => {
    const reasons = useAbsenceReasons();
    return (
        <Autocomplete
            freeSolo
            options={reasons}
            value={value || null}
            inputValue={value ?? ''}
            onChange={(event, newValue) => onChange(newValue ?? '')}
            onInputChange={(event, newValue, reason) => reason === 'input' && onChange(newValue)}
            onBlur={onBlur}
            renderInput={(params) => (
                <TextField {...params} label={label} helperText={helperText} error={error} {...props} />
            )}
        />
    );
};

export const AbsenceReasonInput = ({ source = 'reason', label, validate, ...props }) => {
    const resource = useResourceContext();
    const {
        field,
        fieldState: { error, invalid },
        isRequired,
    } = useInput({ source, validate });
    return (
        <AbsenceReasonAutocomplete
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            label={<FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} />}
            error={invalid}
            helperText={invalid && <InputHelperText error={error?.message} />}
            variant="filled"
            size="small"
            margin="dense"
            {...props}
        />
    );
};
