import { ReferenceOneField, TextField } from 'react-admin';

export const CustomReferenceField = ({ source, reference, target }) => (
    <ReferenceOneField source={source} reference={reference} target={target}>
        <TextField source="name" />
    </ReferenceOneField>
)