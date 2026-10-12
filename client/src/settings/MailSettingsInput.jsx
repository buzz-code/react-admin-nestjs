import { TextInput, maxLength, regex } from 'react-admin';
import { InputAdornment } from '@mui/material';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';

const MAIL_DOMAIN = 'mail.yoman.online';
const aliasValidate = regex(/^[a-zA-Z0-9._-]{3,64}$/, 'יש להשתמש באותיות באנגלית, מספרים, נקודה, מקף או קו תחתון (3-64 תווים)');

export function MailSettingsInput() {
    return (
        <CommonSettingsAccordion
            id="mail-settings"
            title="הגדרות מייל"
            subtitle="שם וכתובת השולח במיילים שנשלחים מהמערכת"
        >
            <TextInput
                source="mailAddressTitle"
                label="resources.settings.fields.mailAddressTitle"
                helperText="השם שיופיע לנמען כשולח המייל"
                fullWidth
                validate={maxLength(255)}
            />
            <TextInput
                source="mailAddressAlias"
                label="resources.settings.fields.mailAddressAlias"
                helperText="הכתובת ממנה יישלחו המיילים"
                fullWidth
                validate={aliasValidate}
                InputProps={{
                    endAdornment: <InputAdornment position="end">@{MAIL_DOMAIN}</InputAdornment>,
                }}
                inputProps={{ dir: 'ltr' }}
            />
        </CommonSettingsAccordion>
    );
}
