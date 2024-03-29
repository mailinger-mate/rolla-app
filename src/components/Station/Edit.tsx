import React from 'react';
import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonGrid, IonLabel, IonList, IonListHeader, IonRow } from '@ionic/react';
import { setStation, Station } from '../../utils/db/station';
// import Input from '../Form/Input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Map, MarkerColor } from '../Map/Map';
import { PageHeader } from '../Layout/PageHeader';
import { latitudeLimit, locationStep, longitudeLimit, mapEditZoom } from '../../config';
import { Coordinates, useLocationContext } from '../../contexts/Location';
import { input2 } from '../Form/control';
import { useFirebaseContext } from '../../contexts/Firebase';
import { GeoPoint } from 'firebase/firestore';
import { useHistory } from 'react-router';
import { Path } from '../../pages/path';

interface Props {
    id?: string;
    routerLink?: string;
    station?: Station;
    onCancel: () => void;
    onSubmit: () => void;
}

enum Field {
    Latitude = 'latitude',
    Longitude = 'longitude',
}

type Form = {
    address?: string;
    [Field.Latitude]?: number;
    [Field.Longitude]?: number;
    name?: string;
}


const StationEdit = React.memo<Props>(({
    id,
    station,
    onCancel,
    onSubmit,
}) => {
    const { db } = useFirebaseContext();
    const { location, setLocation } = useLocationContext();
    // const history = useHistory();

    // const { coordinates } = location;
    const { name, address, location: geopoint } = station || {};

    const values: Form = {
        address,
        name,
        [Field.Latitude]: geopoint?.latitude,
        [Field.Longitude]: geopoint?.longitude
    }

    const { handleSubmit, setValue, register, watch, control } = useForm<Form>({
        mode: 'onChange',
        values,
    });

    // const [location, setLocation] = React.useState(station?.location);
    // const [isLocated, setLocated] = React.useState(false);
    // const locationRef = React.createRef<CreateAnimation>();

    // const name = register('name', {
    //     required: true,
    // });

    const [lat, lng] = watch([Field.Latitude, Field.Longitude]);
    
    React.useEffect(() => {
        if (!lat || !lng) return;
        console.log('latitude', lat, lng);
        setLocation({
            coordinates: { lat, lng },
        })
    }, [lat, lng]);

    React.useEffect(() => {
        if (!location?.coordinates) return;
        const { lat, lng } = location.coordinates
        setValue(Field.Latitude, lat);
        setValue(Field.Longitude, lng);
    }, [
        location?.coordinates
    ]);


    // React.useEffect(() => {
    //     const subscription = watch((value, { name, type }) => console.log('sub', value, name, type));
    //     return () => subscription.unsubscribe();
    // }, [
    //     watch
    // ])

    // React.useEffect(() => {
    //     if (!station) return;
    //     const {
    //         address,
    //         location,
    //         name,
    //     } = station;
    //     setValue('address', address);
    //     // setValue('name', name);
    //     // setValue('latitude', location.latitude);
    //     // setValue('longitude', location.longitude);
    //     // if (security) setSecurity(security.id);
    // }, []);

    const center = React.useMemo<Coordinates | undefined>(() => {
        if (!station) return;
        const { latitude: lat, longitude: lng } = station.location;
        return { lat, lng };
    }, []); 

    const saveStation: SubmitHandler<Form> = ({ name, address }) => {
        // console.log('state', formState.errors, formState.dirtyFields);
        // if (!location) throw new Error('No location');
        if (!location) return;
        const { coordinates: { lat, lng }, h3IndexMax: h3AssetIndex } = location;
        // console.log('saveStation', name, address, coordinates, h3AssetIndex);
        // const geohash = geohashForLocation([location.latitude, location.longitude]);
        setStation(db, {
            name,
            address,
            location: new GeoPoint(lat, lng),
            h3Index: h3AssetIndex,
        }, id).then(id => {
            // history.push(`/${Path.host}/${Path.station}/${id}`)
            onSubmit();
        })
    }

    // const locate = React.useCallback(async () => {
    //     const animation = locationRef.current?.animation;
    //     animation?.play();
    //     await mapInstance
    //         .then(map => map?.locate())
    //         .then(() => setLocated(true))
    //         .finally(() => animation?.stop());
    // }, [mapInstance, locationRef]);

    // const locateButton = React.useMemo(() => {
    //     return (
    //         <IonFabButton
    //             color={isLocated ? 'light' : 'medium'}
    //             size="small"
    //         // onClick={locate}
    //         >
    //             <CreateAnimation
    //                 ref={locationRef}
    //                 duration={1000}
    //                 iterations={Infinity}
    //                 fromTo={{
    //                     property: 'opacity',
    //                     fromValue: '1',
    //                     toValue: '0.5'
    //                 }}
    //             >
    //                 <IonIcon icon={locateOutline} />
    //             </CreateAnimation>
    //         </IonFabButton>
    //     );
    // }, [isLocated]);

    return (
        <>
            <PageHeader title="Edit Station">
                <IonButtons slot="start">
                    <IonButton onClick={onCancel}>
                        Cancel
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                    <IonButton
                        color="primary"
                        onClick={handleSubmit(saveStation)}
                    >
                        Save
                    </IonButton>
                </IonButtons>
            </PageHeader>
            <IonContent>
                <IonGrid class="ion-no-padding ion-no-margin">
                    <IonRow>
                        <IonCol>
                            <Map
                                // grid={false}
                                height="50vh"
                                zoom={mapEditZoom}
                                center={center}
                                scope={false}
                                centerMarker={MarkerColor.Warning}
                                locationCell={true}
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonList>
                    <IonListHeader>
                        <IonLabel>Information</IonLabel>
                    </IonListHeader>
                    {input2<Form>({
                        onChange: value => setValue('name', value),
                        name: 'name',
                        label: 'Name',
                        control,
                    })}
                    {input2<Form>({
                        onChange: value => setValue('address', value),
                        name: 'address',
                        label: 'Address',
                        control,
                    })}
                    {input2<Form>({
                        onChange: value => setValue(Field.Latitude, +value),
                        name: Field.Latitude,
                        label: 'Latitude',
                        type: 'number',
                        step: locationStep,
                        min: -latitudeLimit,
                        max: latitudeLimit,
                        control,
                    })}
                    {input2<Form>({
                        onChange: value => setValue(Field.Longitude, +value),
                        name: Field.Longitude,
                        label: 'Longitude',
                        type: 'number',
                        step: locationStep,
                        min: -longitudeLimit,
                        max: longitudeLimit,
                        control,
                    })}
                    {/* {input<Form>({ label: 'Name' }, name )}
                    {input<Form>({ label: 'Address' }, register('address'))} */}
                    {/* {input<Form>(
                        {
                            label: 'Latitude',
                            // type: 'number',
                            // step: '0.00000001',
                            // min: -85,
                            // max: 85,
                            // debounce: 200,
                        },
                        register('latitude'),
                    )}
                    {input<Form>(
                        {
                            label: 'Longitude',
                            type: 'number',
                            step: '0.00000001',
                            min: -85,
                            max: 85,
                            debounce: 200,
                        },
                        register('longitude'),
                    )} */}
                </IonList>
            </IonContent>
        </>
    )
});

export default StationEdit;
