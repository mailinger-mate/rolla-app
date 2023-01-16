import React from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonText, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { RouteComponentProps } from 'react-router';
import StationEdit from '../../../components/Station/Edit';
import VehicleList from '../../../components/Vehicle/List';
import { useFirebaseContext } from '../../../contexts/Firebase';
import { getStation } from '../../../utils/db/station';
import { Path } from '../../path';
import { Map, MarkerColor } from '../../../components/Map/Map';

type Props = RouteComponentProps<{
    id: string;
}>

var objet = {
    match: true
}

const Edit: React.FC<Props> = ({ match }) => {
    const { id } = match.params;
    const { db } = useFirebaseContext();
    const [station, loading, error] = useDocumentData(getStation(db, id));
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    const [modal, setModal] = React.useState<boolean>();

    const closeModal = () => setModal(false);

    const modalContent = React.useMemo(() => {
        if (!modal) return;

        return (
            <StationEdit
                id={id}
                station={station}
                onCancel={closeModal}
                onSubmit={closeModal}
            />
        );
    }, [modal])

    if (!station) return null;

    const { latitude, longitude } = station.location;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>Station</IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            color="secondary"
                            onClick={() => setModal(true)}
                        >
                            Edit
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Station</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
                {/* <StationEdit id={station} /> */}
                <Map
                    center={[latitude, longitude]}
                    live={false}
                    grid={false}
                    height="200px"
                    centerMarker={MarkerColor.Disabled}
                    zoom={14}
                />
                <IonList>
                    <IonListHeader>
                        <IonLabel>Information</IonLabel>
                    </IonListHeader>
                    <IonItem>
                        <IonLabel>Name</IonLabel>
                        <IonLabel slot="end" color="medium">{station.name}</IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Address</IonLabel>
                        <IonLabel slot="end" color="medium">{station.address}</IonLabel>
                    </IonItem>
                    <IonListHeader>
                        <IonLabel>Vehicles</IonLabel>
                    </IonListHeader>
                    <VehicleList station={id} />
                </IonList>
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

export default Edit;
