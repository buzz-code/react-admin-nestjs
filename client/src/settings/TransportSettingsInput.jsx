import { NumberInput, useGetIdentity } from 'react-admin';
import { CommonSettingsAccordion } from '@shared/components/settings/CommonSettingsAccordion';
import { useIsTransportation } from 'src/utils/appPermissions';

export const TransportSettingsInput = () => {
    const { identity } = useGetIdentity();
    const isTransportation = useIsTransportation();

    if (!isTransportation) {
        return null;
    }

    return (
        <CommonSettingsAccordion
            id="transport-settings"
            title="איחורי הסעות"
            subtitle="קוד החיסור שנשמר לאיחורי הסעות שמדווחים בטלפון"
        >
            <NumberInput
                source="transportAbsenceCode"
                label="resources.settings.fields.transportAbsenceCode"
                helperText="איחור הסעה שידווח בטלפון מעכשיו יישמר עם קוד החיסור הזה. ריק = בלי קוד"
                fullWidth
                defaultValue={identity?.additionalData?.transportAbsenceCode ?? null}
            />
        </CommonSettingsAccordion>
    );
};

export default TransportSettingsInput;
