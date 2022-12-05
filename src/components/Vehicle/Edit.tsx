import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { input } from '../Form/control';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useDocument } from 'react-firebase-hooks/firestore';
import { getVehicle, setVehicle, Vehicle } from '../../utils/db/vehicle';
import EditSecurity from '../Security/Edit';
import { DocumentReference } from 'firebase/firestore';
import AddSecurity from '../Security/Add';

type Form = {
    name: string;
    model: string;
    licenseId: string;
}

interface Props {
    id?: string;
    vehicle?: Vehicle;
    onCancel?: () => void;
    onSubmit?: () => void;
}

const VehicleEdit = React.memo<Props>(({
    id,
    vehicle,
    onCancel,
    onSubmit,
}) => {
    const { db } = useFirebaseContext();
    const { handleSubmit, setValue, register, formState } = useForm<Form>();
    // const [value, loading, error] = useDocument(getVehicle(db, id));
    // const [security, setSecurity] = React.useState<string>();
    // const [present, dismiss] = useIonLoading();

    // React.useEffect(() => {
    //     loading ? present() : dismiss();
    // }, [loading]);

    React.useEffect(() => {
        if (!vehicle) return;
        const {
            licenseId,
            model,
            name,
            // security,
        } = vehicle;
        setValue('name', name);
        setValue('model', model);
        setValue('licenseId', licenseId);
        // if (security) setSecurity(security.id);
    }, [])

    const submit: SubmitHandler<Form> = ({ name, model, licenseId }) => {
        // console.log('state', formState.errors, formState.dirtyFields);
        console.log(name, model, licenseId);
        // const geohash = geohashForLocation([location.latitude, location.longitude]);
        setVehicle(db, {
            name,
            model,
            licenseId,
        }, id).then(id => {
            onSubmit && onSubmit();
        })
    };

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={onCancel}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{id ? 'Edit' : 'Add'} Vehicle</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="secondary" onClick={handleSubmit(submit)}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {input<Form>('Name', register('name'))}
                    {input<Form>('Model', register('model'))}
                    {input<Form>('License', register('licenseId'))}
                </IonList>
            </IonContent>
        </>
    )
});

export default VehicleEdit;
