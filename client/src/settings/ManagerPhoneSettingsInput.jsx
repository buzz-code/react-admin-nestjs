import { TextInput, maxLength, useGetIdentity } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import { useIsSeminarAttendanceYemot } from 'src/utils/appPermissions';

export const ManagerPhoneSettingsInput = () => {
    const { identity } = useGetIdentity();
    const isSeminarAttendanceYemot = useIsSeminarAttendanceYemot();

    if (!isSeminarAttendanceYemot) {
        return null;
    }

    return (
        <CommonSettingsAccordion
            id="manager-phone-settings"
            title="טלפון מנהלת"
            subtitle="מספר הטלפון של המנהלת, לשמיעת דוח נוכחות מורות יומי בטלפון"
        >
            <TextInput
                source="managerPhone"
                label="resources.settings.fields.managerPhone"
                helperText="מהמספר הזה ניתן יהיה להתקשר ולשמוע אילו מורות דיווחו היום ואילו לא"
                fullWidth
                validate={maxLength(11)}
                defaultValue={identity?.additionalData?.managerPhone ?? ''}
            />
        </CommonSettingsAccordion>
    );
};

export default ManagerPhoneSettingsInput;
