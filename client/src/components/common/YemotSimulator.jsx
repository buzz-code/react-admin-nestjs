import { Card, CardContent } from '@mui/material';
import { string } from 'prop-types';
import { useCallback } from 'react';
import { SimpleForm, TextInput, Title, useDataProvider, useNotify, required } from 'react-admin';
import { useMutation } from 'react-query';

const defaultValues = {
    ApiCallId: string(Math.random()),
    ApiDID: '0774311257',
    ApiPhone: '0527609942',
    currentInput: '',
};

const YemotSimulator = () => {
    // const dataProvider = useDataProvider();
    // const notify = useNotify();
    // const { mutate, isLoading } = useMutation();

    // const handleSubmit = useCallback((body) => {
    //     mutate(
    //         ['simulateYemotCall', body],
    //         () => dataProvider.simulateYemotCall(body),
    //         {
    //             onSuccess: (data) => {
    //                 console.log(data)
    //                 notify("Look at the reponse", "info");
    //             },
    //             onFailure: () => {
    //                 notify("A technical error occured while updating your profile. Please try later.", "warning");
    //             }
    //         }
    //     );
    // }, [dataProvider, mutate, notify])

    return null;

    return (
        <Card>
            <Title title="Yemot Simulator" />
            <CardContent>
                {/* <SimpleForm onSubmit={handleSubmit} defaultValues={defaultValues}>
                    <TextInput source="ApiCallId" validate={required()} disabled />
                    <TextInput source="ApiDID" validate={required()} />
                    <TextInput source="ApiPhone" validate={required()} />
                    <TextInput source="currentInput" />
                </SimpleForm> */}
            </CardContent>
        </Card>
    );
}

export default YemotSimulator;
