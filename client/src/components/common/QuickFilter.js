import { useTranslate } from 'react-admin';
import Chip from '@material-ui/core/Chip';

export const QuickFilter = ({ label }) => {
    const translate = useTranslate();
    return <Chip sx={{ marginBottom: 1 }} label={translate(label)} />;
};
