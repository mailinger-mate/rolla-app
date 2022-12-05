import React from 'react';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenuToggle, IonModal, IonNote, IonPage, IonPopover, IonSearchbar, IonTabBar, IonTabButton, IonTabs, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { RouteChildrenProps } from 'react-router';
import { VehicleConnection } from '../../components/Vehicle/Connection';
import { arrowRedo, call, key, keyOutline, navigateOutline, personCircleOutline, refresh } from 'ionicons/icons';
import { useStationContext } from '../../contexts/Station';
import { StationMap } from '../../components/Station/Map';
import { useVehicleContext } from '../../contexts/Vehicle';

import './Map.css';
import { Vehicle } from '../../utils/db/vehicle';

interface ModalProps {
    isOpen: boolean;
    onDismiss: () => void;
}

const StationModal = React.memo<React.PropsWithChildren<ModalProps>>((({
    children,
    onDismiss,
    isOpen,
}) => {
    // const ref = React.useRef<HTMLIonModalElement>(null);

    return (
        <IonModal
            // ref={ref}
            isOpen={isOpen}
            initialBreakpoint={0.25}
            breakpoints={[0, 0.25, 0.5, 0.75]}
            backdropBreakpoint={0.5}
            onIonModalDidDismiss={onDismiss}
        >
            {children}
        </IonModal>
    );
}));

StationModal.displayName = 'StationModal';

const getPadding = (breakpoint: number) => {

}

const MapPage = React.memo<RouteChildrenProps>(({ match }) => {
    const { stations } = useStationContext();
    const { vehicles } = useVehicleContext();

    const [stationId, setStationId] = React.useState<string>();
    const [padding, setPadding] = React.useState<number>();

    const selectStation = React.useCallback((id?: string) => {
        console.log('selectStation', id)
        if (!id) {
            setStationId(undefined);
            setStationOpen(false);
            return;
        }
        setStationId(id);
        setStationOpen(true);
    }, []);

    const header = React.useMemo(() => (
        <IonHeader
        // translucent={true}
        // style={{ position: 'absolute' }}
        >
            <IonToolbar>
                <IonButtons slot="start">
                    <IonMenuToggle>
                        <IonButton>
                            <IonIcon slot="icon-only" icon={personCircleOutline}></IonIcon>
                        </IonButton>
                    </IonMenuToggle>
                </IonButtons>
                <IonTitle>Rentals</IonTitle>
                {/* <IonSearchbar
                    placeholder="Rentals"
                    animated={true}
                    className="ion-no-padding"
                /> */}
            </IonToolbar>
        </IonHeader>
    ), []);

    const fabs = React.useMemo(() => (
        <IonFab
            slot="fixed"
            vertical="top"
            horizontal="end"
        >
            <IonFabButton color="medium" id="position" size="small">
                <IonIcon icon={navigateOutline}></IonIcon>
            </IonFabButton>
            <IonFabButton color="primary" id="ride" size="small">
                <IonIcon icon={keyOutline}></IonIcon>
            </IonFabButton>
        </IonFab>
    ), []);

    function reduceVehicles<Value>(
        stationId: string,
        reducer: (value: Value, vehicle: Vehicle) => Value,
        initialValue: Value,
    ) {
        let value = initialValue;
        // const list: Item[] = [];
        for (const vehicleId in vehicles) {
            const vehicle = vehicles[vehicleId];
            if (vehicle.station.id == stationId) {
                value = reducer(value, vehicle);
            }
        }
        return value;
    };

    const vehicleList = React.useMemo(() => {
        if (!vehicles || !stationId) return null;
        return reduceVehicles<React.ReactNode[]>(stationId, (list, { name, model }) => {
            list.push((
                <IonItem detail={true}>
                    <IonLabel>
                        {name}
                        <p>{model}</p>
                    </IonLabel>
                    {/* <IonIcon slot="end" icon={refresh} size="small" /> */}
                    <IonLabel slot="end" color="medium"><p>14m ago</p></IonLabel>
                </IonItem>
            ))
            return list;
        }, []);
    }, [vehicles, stationId]);

    const stationCard = React.useMemo(() => {
        if (!stations || !stationId) return null;
        const { name, address } = stations[stationId];
        return (
            <IonContent>
                <IonCard className="ion-no-margin">
                    <IonCardHeader>
                        <IonCardTitle>{name}</IonCardTitle>
                        <IonCardSubtitle>{address}</IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonButton>
                            <IonIcon icon={key} slot="start" />
                            <IonLabel>Rent</IonLabel>
                        </IonButton>
                        <IonButton color="light">
                            <IonIcon icon={arrowRedo} slot="start" />
                            <IonLabel>Navigate</IonLabel>
                        </IonButton>
                        <IonButton color="light">
                            <IonIcon icon={call} slot="start" />
                            <IonLabel>Call</IonLabel>
                        </IonButton>
                    </IonCardContent>
                </IonCard>
                <IonList className="ion-no-padding">
                    <IonListHeader>
                        <IonLabel>Vehicles</IonLabel>
                    </IonListHeader>
                    {vehicleList}
                </IonList>
            </IonContent>
        )
    }, [stations, stationId]);

    const setBreakpointPadding = (breakpoint: Promise<number | undefined>) => {
        breakpoint.then(value => {
            setPadding(value && Math.round(value * document.body.clientHeight / 2))
        });
    }

    const [isStationOpen, setStationOpen] = React.useState(false);
    const stationModalRef = React.useRef<HTMLIonModalElement>(null);
    const stationModal = React.useMemo(() => {
        return (
            <IonModal
                ref={stationModalRef}
                isOpen={isStationOpen}
                initialBreakpoint={0.5}
                breakpoints={[0, 0.25, 0.5, 0.75]}
                backdropBreakpoint={0.5}
                onIonModalDidDismiss={() => selectStation()}
                onIonBreakpointDidChange={(event) => {
                    setBreakpointPadding(event.target.getCurrentBreakpoint());
                }}
            >
                {stationCard}
            </IonModal>
        );
    }, [isStationOpen, stationCard]);

    const searchModalRef = React.useRef<HTMLIonModalElement>(null);

    const minimize = React.useCallback(() => {
        console.log('minimize', stationId);
        if (!stationId) return;
        searchModalRef.current?.setCurrentBreakpoint(0.1);
        stationModalRef.current?.setCurrentBreakpoint(0.25);
    }, [stationId])

    const hide = () => {
        setStationOpen(false);
    }

    const stationList = React.useMemo(() => {
        if (!stations) return null;
        const list: React.ReactNode[] = [];

        for (const id in stations) {
            const { name, address } = stations[id];
            const count = vehicles && reduceVehicles(id, count => count += 1, 0);
            const onClick = () => {
                minimize();
                selectStation(id);
            };

            list.push((
                <IonItem onClick={onClick}>
                    <IonLabel>
                        {name}
                        <p>{address}</p>
                    </IonLabel>
                    <IonLabel slot="end" color="medium">{count}</IonLabel>
                </IonItem>
            ))
        }
        return list;
    }, [stations, vehicles]);

    const searchModal = React.useMemo(() => {
        return (
            <IonModal
                ref={searchModalRef}
                isOpen={true}
                // onBlur={() => console.log('blur')}
                // trigger="connect"
                initialBreakpoint={0.1}
                breakpoints={[0.1, 0.5]}
                backdropBreakpoint={1}
                backdropDismiss={false}
                showBackdrop={false}
            // onIonModalWillPresent={() => mainModalRef.current?.setAttribute('style', `--height: 100px`)}
            >
                <IonHeader>
                    <IonSearchbar
                        onClick={() => searchModalRef.current?.setCurrentBreakpoint(0.5)}
                        placeholder="Search"
                    />
                </IonHeader>
                <IonContent>
                    {/* <IonItem lines="none" className="ion-no-padding">
                    <IonButton slot="end" color="dark">
                        <IonIcon slot="icon-only" icon={keyOutline} className="ion-padding-vertical" />
                    </IonButton>
                </IonItem> */}
                    <IonList>
                        {stationList}
                    </IonList>
                    {/* <VehicleConnection /> */}
                </IonContent>
            </IonModal>
        )
    }, [stationList]);

    const rideModal = React.useMemo(() => {
        return (
            <IonModal
                trigger="ride"
                initialBreakpoint={0.75}
            // breakpoints={[0, 0.75]}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Ride</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <VehicleConnection />
                </IonContent>
            </IonModal>
        )
    }, []);

    const [center, setCenter] = React.useState<string[]>();

    React.useEffect(() => {
        if (!stationId) return;
        setCenter([stationId]);
    }, [stationId])

    return (
        <IonPage>
            {header}
            <IonContent fullscreen={true} scrollY={false}>
                <StationMap
                    onBlur={minimize}
                    onClick={hide}
                    onFocus={selectStation}
                    center={center}
                    padding={padding}
                />
                {fabs}
                {searchModal}
                {stationModal}
                {rideModal}
            </IonContent>
            {/* <IonFooter translucent={true}>
                <IonToolbar>
                    <IonSearchbar></IonSearchbar>
                </IonToolbar>
            </IonFooter> */}
        </IonPage>
    );
});

MapPage.displayName = 'MapPage';

export default MapPage;
