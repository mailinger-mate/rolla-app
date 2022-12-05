import React from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonSearchbar, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { RouteComponentProps, useHistory } from 'react-router';
import { Path } from '../../path';
import { useFirebaseContext } from '../../../contexts/Firebase';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDocument, useDocumentData, useDocumentOnce } from 'react-firebase-hooks/firestore';
import { getVehicle, setVehicle } from '../../../utils/db/vehicle';
import { input } from '../../../components/Form/control';
import EditSecurity from '../../../components/Security/Edit';
import AddSecurity from '../../../components/Security/Add';
import StationList from '../../../components/Station/List';
import { getStation, Station } from '../../../utils/db/station';
import { DocumentSnapshot, getDoc } from 'firebase/firestore';
import VehicleEdit from '../../../components/Vehicle/Edit';

type Form = {
    name: string;
    model: string;
    licenseId: string;
}

type Props = RouteComponentProps<{
    id: string;
}>

const VehicleItemPage: React.FC<Props> = ({ match }) => {
    const { id } = match.params;

    const { db } = useFirebaseContext();
    const history = useHistory();

    // const { handleSubmit, setValue, register, formState } = useForm<Form>();
    const [vehicle, loading, error] = useDocumentData(getVehicle(db, id));
    const [security, setSecurity] = React.useState<string>();
    const [station, setStation] = React.useState<Station>();
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    React.useEffect(() => {
        if (!vehicle || !id) return;
        const {
            licenseId,
            model,
            name,
            security,
            station: stationReference,
        } = vehicle;
        // setValue('name', name);
        // setValue('model', model);
        // setValue('licenseId', licenseId);
        if (security) setSecurity(security.id);
        if (stationReference) {
            getDoc(stationReference).then(document => {
                setStation(document.data())
            });
        }
    }, [vehicle]);

    const changeStation = React.useCallback((
        document: DocumentSnapshot<Station>,
    ) => {
        const data = document.data();
        if (!data) return;
        present();
        setVehicle(db, {
            station: document.ref,
            geohash: data.geohash,
        }, id)
            .then(() => {
                setStation(data);
                setModal(undefined);
            })
            .finally(() => {
                dismiss();
            });
    }, [id]);

    const modalRef = React.useRef<HTMLIonModalElement>(null);
    const [modal, setModal] = React.useState<'station' | 'vehicle' | false>();

    const closeModal = () => setModal(false);

    const modalContent = React.useMemo(() => {
        if (!modal) return null;
        if (modal === 'vehicle') {
            return (
                <VehicleEdit
                    id={id}
                    vehicle={vehicle}
                    onCancel={closeModal}
                    onSubmit={closeModal}
                />
            );
        }
        return (
            <>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={closeModal}>
                                Cancel
                            </IonButton>
                        </IonButtons>
                        <IonTitle>Select Station</IonTitle>
                        {/* <IonButtons slot="end">
                            <IonButton strong={true} onClick={() => confirm()}>
                                Confirm
                            </IonButton>
                        </IonButtons> */}
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <StationList
                        onSelect={changeStation}
                        search={true}
                    />
                </IonContent>
            </>
        )
    }, [modal, id]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>Vehicle</IonTitle>
                    <IonButtons slot="end">
                        {/* <IonButton onClick={handleSubmit(onSubmit)} color="secondary">Save</IonButton> */}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonImg src="/assets/niu.png" />
                <IonList>
                    <IonListHeader>
                        <IonLabel>Information</IonLabel>
                    </IonListHeader>
                    {/* {input<Form>('Name', register('name'))}
                    {input<Form>('Model', register('model'))}
                    {input<Form>('License', register('licenseId'))} */}
                    <IonItem>
                        <IonLabel>Name</IonLabel>
                        <IonLabel slot="end" color="medium">{vehicle?.name}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Model</IonLabel>
                        <IonLabel slot="end" color="medium">{vehicle?.model}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>License</IonLabel>
                        <IonLabel slot="end" color="medium">{vehicle?.licenseId}</IonLabel>
                    </IonItem>
                    <IonItem lines="none">
                        <IonLabel color="secondary" onClick={() => setModal('vehicle')}>
                            Edit Details
                        </IonLabel>
                    </IonItem>
                </IonList>
                <IonList>
                    <IonListHeader>
                        <IonLabel>Location</IonLabel>
                    </IonListHeader>

                    {/* <IonItem lines="none">
                        <IonLabel className="ion-text-wrap">
                            Location of the vehicles are derived
                            from the stations they are assigned to.
                        </IonLabel>
                    </IonItem> */}
                    <IonItem detail={true} onClick={() => setModal('station')}>
                        <IonLabel>Station</IonLabel>
                        <IonLabel slot="end" color="medium">{station?.name}</IonLabel>
                    </IonItem>
                    {/* <IonItem lines="none">
                        <IonLabel color="secondary">Change Station</IonLabel>
                    </IonItem> */}
                </IonList>
                {security
                    ? <EditSecurity id={security} />
                    : <AddSecurity />}


                <IonModal
                    // ref={modalRef}
                    isOpen={!!modal}
                    onDidDismiss={() => setModal(false)}
                    // trigger="open-modal"
                    // initialBreakpoint={0.5}
                    // breakpoints={[0.5, 1]}
                    backdropDismiss={true}
                // backdropBreakpoint={0.5}
                >
                    {modalContent}
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default VehicleItemPage;
