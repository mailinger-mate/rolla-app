import React from 'react';
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuToggle, IonModal, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { RouteChildrenProps } from 'react-router';
import { VehicleConnection } from '../../components/Vehicle/Connection';
import { key, personCircleOutline } from 'ionicons/icons';
import { useStationContext } from '../../contexts/Station';
import { StationMap } from '../../components/Station/Map';

interface ModalProps {
    isOpen: boolean;
    hide: () => void;
}

const StationModal = React.memo<React.PropsWithChildren<ModalProps>>((({
    children,
    hide,
    isOpen,
}) => {
    const ref = React.useRef<HTMLIonModalElement>(null);

    return (
        <IonModal
            ref={ref}
            isOpen={isOpen}
            initialBreakpoint={0.25}
            breakpoints={[0, 0.25, 0.5, 0.75]}
            backdropBreakpoint={0.5}
            onIonModalDidDismiss={hide}
        >
            {children}
        </IonModal>
    );
}));

StationModal.displayName = 'StationModal';

const MapPage = React.memo<RouteChildrenProps>(({ match }) => {
    const { stations } = useStationContext();

    const [id, setId] = React.useState<string>();
    // const [station, setStation] = React.useState<Station>();
    // const [vehicles, setVehicles] = React.useState<Vehicle[]>();
    const [isOpen, setOpen] = React.useState(false);

    // const modalRef = React.useRef<HTMLIonModalElement>(null);
    // const modalContentRef = React.createRef<HTMLIonContentElement>();

    // const idRef = React.useRef<string>();

    const selectStation = React.useCallback((id?: string) => {
        if (!id) return setOpen(false);
        setId(id);
        setOpen(true);
    }, [isOpen]);


    const header = React.useMemo(() => (
        <IonHeader
            translucent={true}
            style={{ position: 'absolute' }}
        >
            <IonToolbar>
                <IonButtons slot="start">
                    <IonMenuToggle>
                        <IonButton>
                            <IonIcon slot="icon-only" icon={personCircleOutline}></IonIcon>
                        </IonButton>
                    </IonMenuToggle>
                </IonButtons>
                <IonTitle>Stations</IonTitle>
            </IonToolbar>
        </IonHeader>
    ), []);

    const rideFab = React.useMemo(() => (
        <IonFab
            slot="fixed"
            vertical="bottom"
            horizontal="end"
        >
            <IonFabButton color="primary">
                <IonIcon icon={key}></IonIcon>
            </IonFabButton>
        </IonFab>
    ), []);

    const station = React.useMemo(() => {
        if (!stations || !id) return null;
        const station = stations[id];
        return (
            <IonContent className="ion-padding">
                <IonText><h1>{station.name}</h1></IonText>
                <IonText><p>{station.address}</p></IonText>
            </IonContent>
        )
    }, [stations, id]);

    React.useEffect(() => {
        if (isOpen && !station) setOpen(false);
    }, [isOpen, station]);

    return (
        <IonPage>
            {header}
            <IonContent fullscreen={true} scrollY={false}>
                <StationMap selectStation={selectStation} />
                <VehicleConnection />
                {rideFab}
                <StationModal isOpen={isOpen} hide={() => selectStation()}>
                    {station}
                </StationModal>
            </IonContent>
            {/* <IonFooter translucent={true}>
                <IonToolbar>
                    <IonTitle>Footer</IonTitle>
                </IonToolbar>
            </IonFooter> */}
        </IonPage>
    );
});

MapPage.displayName = 'MapPage';

export default MapPage;
