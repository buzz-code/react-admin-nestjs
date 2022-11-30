import { Card, CardContent } from '@mui/material';
import { useCallback, useState } from 'react';
import { SimpleForm, TextInput, Title, useDataProvider, useNotify, required } from 'react-admin';
import { useMutation } from 'react-query';

const defaultValues = {
    ApiCallId: String(Math.random()),
    ApiDID: '0774311257',
    ApiPhone: '0527609942',
    currentInput: '',
};

const YemotSimulator = () => {
    const dataProvider = useDataProvider();
    const [history, setHistory] = useState([]);
    const notify = useNotify();
    const { mutate, isLoading } = useMutation({
        mutationFn: (body) => dataProvider.simulateYemotCall(body),
        onSuccess: (data) => {
            setHistory(prevData => ([...prevData, data.body]))
            notify("Success", { type: 'info' });
        },
        onError: () => {
            notify("A technical error occured while updating your profile. Please try later.", { type: 'warning' });
        }
    });

    const handleSubmit = useCallback((body) => {
        console.log({ body })
        mutate(body);
    }, [mutate])

    return (
        <Card>
            <Title title="Yemot Simulator" />
            <CardContent>
                <SimpleForm onSubmit={handleSubmit} defaultValues={defaultValues}>
                    <TextInput source="ApiCallId" validate={required()} disabled />
                    <TextInput source="ApiDID" validate={required()} />
                    <TextInput source="ApiPhone" validate={required()} />
                    <TextInput source="currentInput" />
                </SimpleForm>
                {history.map(item => <div>{item}</div>)}
            </CardContent>
        </Card>
    );
}

export default YemotSimulator;
