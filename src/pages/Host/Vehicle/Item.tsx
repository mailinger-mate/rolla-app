import React from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { RouteComponentProps, useHistory } from 'react-router';
import { Path } from '../../path';
import { useFirebaseContext } from '../../../contexts/Firebase';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDocument } from 'react-firebase-hooks/firestore';
import { getVehicle, setVehicle } from '../../../utils/db/vehicle';
import { input } from '../../../components/Form/control';
import EditSecurity from '../../../components/Security/Edit';
import AddSecurity from '../../../components/Security/Add';

type Form = {
    name: string;
    model: string;
    licenseId: string;
}

type Props = RouteComponentProps<{
    id: string;
}>

const VehicleItemPage: React.FC<Props> = ({ match }) => {
    const id = match.params.id;

    const { db } = useFirebaseContext();
    const history = useHistory();

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


    const onSubmit: SubmitHandler<Form> = ({ name, model, licenseId }) => {
        // console.log('state', formState.errors, formState.dirtyFields);
        console.log(name, model, licenseId);
        // const geohash = geohashForLocation([location.latitude, location.longitude]);
        setVehicle(db, {
            name,
            model,
            licenseId,
            // geohash,
        }, id).then(id => {
            history.push(`/${Path.host}/${Path.vehicle}`)
        })
    }

    const modal = React.useRef<HTMLIonModalElement>(null);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>{id ? 'Edit' : 'New'} Vehicle</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSubmit(onSubmit)} color="secondary">Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonImg src="/assets/niu.png" />
                <IonList>
                    {input<Form>('Name', register('name'))}
                    {input<Form>('Model', register('model'))}
                    {input<Form>('License', register('licenseId'))}
                </IonList>
                {security
                    ? <EditSecurity id={security} />
                    : <AddSecurity />}


                <IonModal
                    ref={modal}
                    // trigger="open-modal"
                    isOpen={true}
                    initialBreakpoint={0.25}
                    breakpoints={[0.25, 0.5, 0.75]}
                    backdropDismiss={false}
                    backdropBreakpoint={0.5}
                >
                    <IonContent className="ion-padding">
                        <IonSearchbar onClick={() => modal.current?.setCurrentBreakpoint(0.75)} placeholder="Search"></IonSearchbar>
                        <IonList>
                            <IonItem>
                                <IonLabel>
                                    <h2>Connor Smith</h2>
                                    <p>Sales Rep</p>
                                </IonLabel>
                            </IonItem>
                        </IonList>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default VehicleItemPage;
