import React from 'react';
import { IonImg, IonItem, IonLabel, IonList, useIonLoading } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { input } from '../Form/control';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useDocument } from 'react-firebase-hooks/firestore';
import { getVehicle } from '../../utils/db/vehicle';
import EditSecurity from '../Security/Edit';
import { DocumentReference } from 'firebase/firestore';
import AddSecurity from '../Security/Add';

type Form = {
    name: string;
    model: string;
    licenseId: string;
}

interface Props {
    id: string;
}

const VehicleEdit = React.memo<Props>(({
    id,
}) => {
    const { db } = useFirebaseContext();
    const { handleSubmit, setValue, register, formState } = useForm<Form>();
    const [value, loading, error] = useDocument(getVehicle(db, id));
    const [security, setSecurity] = React.useState<string>();
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    React.useEffect(() => {
        if (!value || !id) return;
        const {
            licenseId,
            model,
            name,
            security,
        } = value.data()!;
        setValue('name', name);
        setValue('model', model);
        setValue('licenseId', licenseId);
        if (security) setSecurity(security.id);
    }, [value]);

    return (
        <>
            <IonImg src="/assets/niu.png" />
            <IonList>
                {input<Form>('Name', register('name'))}
                {input<Form>('Model', register('model'))}
                {input<Form>('License', register('licenseId'))}
            </IonList>
            {security
                ? <EditSecurity id={security} />
                : <AddSecurity />}
        </>
    )
});

export default VehicleEdit;
