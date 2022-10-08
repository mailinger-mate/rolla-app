import React from 'react';
import { CreateAnimation, IonButton, IonCol, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonNote, IonRow, IonTextarea, useIonViewWillEnter } from '@ionic/react';
import { add, locateOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { useFirebaseContext } from '../../contexts/Firebase';
import { getStation, setStation } from '../../utils/db/station';
import { style } from '../../utils/map/style';
import { GeoPoint } from 'firebase/firestore';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import VehicleList from '../Vehicle/List';
// import Input from '../Form/Input';
import { Controller, FieldError, FieldValues, Path, SubmitHandler, useForm, UseFormRegister, UseFormRegisterReturn } from 'react-hook-form';
import { useHistory } from 'react-router';
import { Path as APath } from '../../pages/path';

interface Props {
    id?: string;
    routerLink?: string;
}

type Form = {
    name: string;
    address: string;
}

type IPRegion = {
    latitude?: number;
    longitude?: number;
}

const defaultRegion = new GeoPoint(12.8496205, 102.2656407);

interface InputProps<F extends FieldValues> {
    name: Path<F>;
    required?: boolean;
    register: UseFormRegisterReturn<Path<F>>;
}

function control<F extends FieldValues>(
    label: string,
    register: UseFormRegisterReturn<Path<F>>,
    error?: FieldError,
) {
    return (
        <IonItem className={error && 'ion-invalid'}>
            <IonLabel position="floating">{label}</IonLabel>
            <IonInput type="text" {...register} />
            {error && <IonNote slot="error">{error.message || 'Required'}</IonNote>}
        </IonItem>
    );
    // console.log(register);
    // const control = register(name, { required });
    return <IonInput type="text" {...register} />;
}

const StationEdit = React.memo<Props>(({ id }) => {
    const { db } = useFirebaseContext();
    const history = useHistory();

    const { googleMaps } = useGoogleMapContext();
    const { handleSubmit, setValue, register, formState } = useForm<Form>();

    const [location, setLocation] = React.useState(defaultRegion);
    const [isLocated, setLocated] = React.useState(false);
    const locationRef = React.createRef<CreateAnimation>();

    const mapRef = React.useRef<HTMLDivElement>(null);

    const onSubmit: SubmitHandler<Form> = ({ name, address }) => {
        // console.log('state', formState.errors, formState.dirtyFields);
        console.log(name, address, location);
        setStation(db, {
            name,
            address,
            location,
        }).then(id => {
            history.push(`/${APath.host}/${APath.station}`)
        })
    }
    // console.log('router', routerLink)

    const mapInstance = React.useMemo(() => {
        const station = id ? getStation(db, id) : null;
        let isChanged: boolean;

        return googleMaps.then(({ Map, Marker, LatLng }) => {
            if (!mapRef.current) return;
            const zoom = 15;
            const { latitude, longitude } = defaultRegion;
            const center = station && new LatLng(latitude, longitude);

            const map = new Map(
                mapRef.current,
                {
                    center,
                    zoom: 4,
                    disableDefaultUI: true,
                    styles: style,
                    keyboardShortcuts: false,
                    backgroundColor: '#000'
                }
            );

            const marker = new Marker({ map });

            const mark = () => {
                if (!isChanged) return isChanged = true;
                const position = map.getCenter()?.toJSON()!;
                marker.setPosition(position);
                setLocation(new GeoPoint(position.lat, position.lng));
                setLocated(false);
            };

            map.addListener('center_changed', mark);
            map.addListener('zoom_changed', mark);

            const locate = async () => {
                const { coords } = await Geolocation.getCurrentPosition();
                const center = new LatLng(coords.latitude, coords.longitude);
                map.moveCamera({ center, zoom });
                marker.setPosition(center);
            }

            if (station) {
                station.then(documentSnapshot => {
                    const { name, location, address } = documentSnapshot.data()!;
                    const { latitude, longitude } = location;
                    const center = new LatLng(latitude, longitude);

                    setValue('name', name);
                    setValue('address', address);

                    map.moveCamera({ center, zoom });
                    marker.setPosition(center);
                });
            } else {
                window.fetch('https://ipapi.co/json/', { cache: 'force-cache' }).then(response => {
                    response.json().then(({ latitude, longitude }: IPRegion) => {
                        if (!latitude || !longitude || location !== defaultRegion) return;
                        map.setCenter(new LatLng(latitude, longitude));
                    });
                });
            }

            return {
                locate,
            };
        });
    }, [mapRef]);

    const locate = React.useCallback(async () => {
        const animation = locationRef.current?.animation;
        animation?.play();
        await mapInstance
            .then(map => map?.locate())
            .then(() => setLocated(true))
            .finally(() => animation?.stop());
    }, [mapInstance, locationRef]);

    const locateButton = React.useMemo(() => {
        return (
            <IonFabButton color={isLocated ? 'light' : 'dark'} onClick={locate}>
                <CreateAnimation
                    ref={locationRef}
                    duration={1000}
                    iterations={Infinity}
                    fromTo={{
                        property: 'opacity',
                        fromValue: '1',
                        toValue: '0.5'
                    }}
                >
                    <IonIcon icon={locateOutline} />
                </CreateAnimation>
            </IonFabButton>
        );
    }, [isLocated]);

    return (
        <>
            <IonList>
                <IonGrid class="ion-no-padding ion-no-margin">
                    <IonRow>
                        <IonCol>
                            <div ref={mapRef} style={{
                                width: '100%',
                                height: '300px'
                            }} />
                            <IonFab vertical="bottom" horizontal="end">
                                {locateButton}
                            </IonFab>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                {control<Form>(
                    'Station Name',
                    register('name', {
                        required: true,
                    }),
                    formState.errors.name,
                )}
                {control<Form>(
                    'Address',
                    register('address', {
                        required: true,
                    }),
                    formState.errors.address,
                )}
                {/* <IonItem counter={true}>
                    <IonLabel position="floating">Description</IonLabel>
                    <IonTextarea
                        autoGrow={true}
                        value={description}
                        maxlength={100}
                        onIonChange={e => setDescription(e.detail.value!)}
                    />
                </IonItem> */}
                <div className="ion-padding">
                    <IonButton expand="full" onClick={handleSubmit(onSubmit)}>
                        Save
                    </IonButton>
                </div>

            </IonList>
        </>
    )
});

export default StationEdit;
