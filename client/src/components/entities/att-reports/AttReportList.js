import { Datagrid, DateField, List, NumberField, ReferenceField, TextField } from 'react-admin';

export const AttReportList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="studentTz" />
            <ReferenceField source="teacherId" reference="teachers" />
            <ReferenceField source="klassId" reference="klasses" />
            <ReferenceField source="lessonId" reference="lessons" />
            <DateField source="reportDate" />
            <NumberField source="howManyLessons" />
            <DateField source="absCount" />
            <DateField source="approvedAbsCount" />
            <TextField source="comments" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
            <TextField source="sheetName" />
        </Datagrid>
    </List>
);