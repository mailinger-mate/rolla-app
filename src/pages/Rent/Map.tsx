import React from 'react';
import { IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import { RouteChildrenProps } from 'react-router';
import { arrowRedo, call, navigateOutline, searchOutline } from 'ionicons/icons';
import { useStationContext } from '../../contexts/Station';
import { StationMap, View } from '../../components/Station/Map';
import { useVehicleContext } from '../../contexts/Vehicle';

import './Map.css';
import { Vehicle } from '../../utils/db/vehicle';
import { VehicleConnectButton } from '../../components/Vehicle/ConnectButton';
import { PageHeader } from '../../components/Layout/PageHeader';
import { ContractItem } from '../../components/Contract/Item';
import { useContractContext } from '../../contexts/Contract';
import { useAgentContext } from '../../contexts/Agent';
import { useLocationContext } from '../../contexts/Location';

enum Breakpoint {
    Station = 0.5,
    StationMinimized = 0.1,
    Search = 0.5,
}

const MapPage = React.memo<RouteChildrenProps>(({ match }) => {
    const { watchPosition, position } = useLocationContext();
    const { stations } = useStationContext();
    const { vehicles } = useVehicleContext();
    const { hasLease } = useContractContext();
    const { select: select } = useAgentContext();

    const [stationId, setStationId] = React.useState<string>();
    const [vehicleId, setVehicleId] = React.useState<string>('esper');

    const [padding, setPadding] = React.useState<number>();
    const [center, setCenter] = React.useState<string[] | boolean>(true);
    // const [filter, setFilter] = React.useState(false);

    const [isStationOpen, setStationOpen] = React.useState(false);
    const stationModalRef = React.useRef<HTMLIonModalElement>(null);

    // React.useEffect(() => {
    //     if (!stationId) return;
    //     setCenter([stationId]);
    // }, [stationId]);

    const selectStation = (id: string) => {
        if (!id) return;
        console.log('selectStation', id);
        setStationId(id);
        setStationOpen(true);
        setSearchOpen(false);
        stationModalRef.current?.setCurrentBreakpoint(0.5);
        setCenter([id]);
        setPadding(Breakpoint.Station);
    };

    // const openStation = React.useCallback((breakpoint: Breakpoint) => {
    //     // stationModalRef.current?.setCurrentBreakpoint(breakpoint);
    //     setStationOpen(true);
    // }, [stationModalRef]);

    const [isLocating, setLocating] = React.useState(false);

    React.useEffect(() => {
        if (isLocating && position) setLocating(false);
    }, [position]);

    const locatee = () => {
        // setLocating(true);
        // watchPosition();
        // locate();
    }

    const fabs = React.useMemo(() => (
        <IonFab
            slot="fixed"
            vertical="top"
            horizontal="end"
        >
            <IonFabButton
                color="medium"
                id="position"
                size="small"
                onClick={locatee}
            >
                {isLocating
                    ? <IonSpinner name="crescent" />
                    : <IonIcon icon={navigateOutline} />}
            </IonFabButton>
            <VehicleConnectButton />
        </IonFab>
    ), [isLocating]);

    function reduceVehicles<Value>(
        stationId: string,
        reducer: (value: Value, vehicle: Vehicle, vehicleId: string) => Value,
        initialValue: Value,
    ) {
        let value = initialValue;
        // const list: Item[] = [];
        for (const vehicleId in vehicles) {
            const vehicle = vehicles[vehicleId];
            if (vehicle.station.id == stationId) {
                value = reducer(value, vehicle, vehicleId);
            }
        }
        return value;
    };

    const selectVehicle = (vehicleId: string) => {
        if (hasLease(vehicleId)) {
            select();
        }
        else {
            setVehicleId(vehicleId);
            setContractOpen(true);
        }
    }

    const vehicleList = React.useMemo(() => {
        if (!vehicles || !stationId) return null;
        return reduceVehicles<React.ReactNode[]>(stationId, (list, { name, model }, id) => {
            list.push((
                <IonItem onClick={() => selectVehicle(id)} button={true} detail={true} key={id}>
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
                        {/* <IonButton>
                            <IonIcon icon={key} slot="start" />
                            <IonLabel>Rent</IonLabel>
                        </IonButton> */}
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


    // React.useEffect(() => {
    //     if (!drag) return;
    //     if (isStationOpen)
    //     // stationModalRef.current?.setCurrentBreakpoint(0.15).then(() => setDrag(false))
    // }, [drag, isStationOpen]);

    const setBreakpointPadding = React.useCallback((event: Event) => {
        // if (drag) return;
        const target = event.target as HTMLIonModalElement;
        if (target) target.getCurrentBreakpoint().then(breakpoint => {
            if (breakpoint) setPadding(breakpoint);
        });
    }, []);


    const stationModal = React.useMemo(() => {
        return (
            <IonModal
                ref={stationModalRef}
                isOpen={isStationOpen}
                initialBreakpoint={Breakpoint.Station}
                breakpoints={[0, Breakpoint.StationMinimized, Breakpoint.Station, 0.75]}
                backdropBreakpoint={Breakpoint.Station}
                onIonModalDidDismiss={() => setStationId(undefined)}
                onIonBreakpointDidChange={setBreakpointPadding}
            // onIonModalDidPresent={setBreakpointPadding}
            >
                {stationCard}
            </IonModal>
        );
    }, [isStationOpen, stationCard]);

    const searchModalRef = React.useRef<HTMLIonModalElement>(null);

    const [isStationMiminized, setStationMinimized] = React.useState(false);

    const minimizeStation = React.useCallback(() => {
        if (isStationMiminized) return;
        setCenter(false);
        searchModalRef.current?.dismiss();
        stationModalRef.current?.getCurrentBreakpoint().then(breakpoint => {
            if (breakpoint && breakpoint >= Breakpoint.Station) {
                stationModalRef.current?.setCurrentBreakpoint(Breakpoint.StationMinimized);
                setStationMinimized(true);
            }
        });
    }, [isStationMiminized]);

    const hideAll = () => {
        setStationOpen(false);
        setSearchOpen(false);
    }

    const [isSearchOpen, setSearchOpen] = React.useState(false);
    const [search, setSearch] = React.useState<string>();
    const searchBarRef = React.useRef<HTMLIonSearchbarElement>(null);

    const stationList = React.useMemo(() => {
        if (!stations || !isSearchOpen) return null;
        const list: React.ReactNode[] = [];
        const filter: string[] = [];

        for (const stationId in stations) {
            const { name, address } = stations[stationId];
            if (search
                && !name.toLowerCase().includes(search)
                && !address.toLowerCase().includes(search)) continue;

            const count = vehicles && reduceVehicles(stationId, count => count += 1, 0);
            const onClick = () => {
                setSearchOpen(false);
                // minimize();
                selectStation(stationId);
            };

            filter.push(stationId);
            list.push((
                <IonItem button={true} onClick={onClick} key={stationId}>
                    <IonLabel>
                        {name}
                        <p>{address}</p>
                    </IonLabel>
                    {/* <IonLabel slot="end" color="medium">{count}</IonLabel> */}
                    <IonBadge slot="end" color="primary">{count}</IonBadge>
                </IonItem>
            ));
        }
        if (filter.length) {
            setCenter(filter);
            // setFilter(true);
        }
        return list;
    }, [stations, vehicles, search, isSearchOpen]);

    const startSearch = () => {
        // setBreakpointPadding(event);
        setStationOpen(false);
        setSearchOpen(true);
        setCenter(true);
        setPadding(Breakpoint.Search);
        searchBarRef.current?.querySelector('input')?.focus();
    }

    const changeSearch = (event: Event) => {
        const target = event.target as HTMLIonSearchbarElement;
        if (target) setSearch(target.value!.toLowerCase());
    }

    const cancelSearch = () => {
        setSearch(undefined);
        setSearchOpen(false);
    }

    const searchModal = React.useMemo(() => {
        return (
            <IonModal
                ref={searchModalRef}
                isOpen={isSearchOpen}
                backdropDismiss={true}
                backdropBreakpoint={0.75}
                initialBreakpoint={Breakpoint.Search}
                breakpoints={[0, Breakpoint.Search, 0.75]}
                onIonModalDidDismiss={() => setSearchOpen(false)}
                // onIonModalDidPresent={onSearchStart}
                onIonBreakpointDidChange={setBreakpointPadding}
            >
                <IonContent>
                    <IonSearchbar
                        ref={searchBarRef}
                        placeholder="Search Rentals"
                        debounce={150}
                        showCancelButton="always"
                        onIonChange={changeSearch}
                        // onClick={() => setSearchModalOpen(true)}
                        onIonCancel={cancelSearch}
                    />
                    <IonList>
                        <IonItem detail={true}>
                            <IonLabel>
                                Africa
                                <p>Continent</p>
                            </IonLabel>
                        </IonItem>
                        {stationList}
                    </IonList>
                    {/* <VehicleConnection /> */}
                </IonContent>
            </IonModal>
        )
    }, [isSearchOpen, stationList]);

    const [isContractOpen, setContractOpen] = React.useState(false);

    const useContract = () => {
        setContractOpen(false);
    }

    const cancelContract = () => {
        setContractOpen(false);
    }

    const contract = React.useMemo(() => {
        // if (!vehicles || !vehicleId) return;
        const vehicle = vehicles && vehicles[vehicleId];
        return (
            <ContractItem
                vehicle={vehicle}
                id={vehicleId}
                onCancel={cancelContract}
                onSubmit={useContract}
            />
        )
    }, [vehicles, vehicleId]);

    const contractModal = React.useMemo(() => (
        <IonModal
            isOpen={isContractOpen}
        >
            {contract}
        </IonModal>
    ), [isContractOpen, contract]);

    const view: View = React.useMemo(() => {
        return { center, padding };
    }, [center, padding]);

    return (
        <IonPage>
            <PageHeader title="Rentals" menuButton={true}>
                {/* <IonSearchbar
                    className="ion-no-padding"
                    placeholder="Rentals"
                    animated={true}
                    debounce={300}
                    onClick={() => setSearchModalOpen(true)}
                /> */}
                <IonButtons slot="end">
                    <IonButton onClick={startSearch}>
                        <IonIcon slot="icon-only" icon={searchOutline} />
                    </IonButton>
                </IonButtons>
            </PageHeader>
            <IonContent fullscreen={true} scrollY={false}>
                <StationMap
                    // onBlur={minimize}
                    onDrag={minimizeStation}
                    onClick={hideAll}
                    onFocus={selectStation}
                    // center={center}
                    // filter={filter}
                    view={view}
                />
                {fabs}
                {searchModal}
                {stationModal}
                {contractModal}
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
