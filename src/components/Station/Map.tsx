import React from 'react';
import { defaultRegion } from '../../config';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { style } from '../../utils/map/style';

const StationMap = React.memo(() => {
    const { googleMaps } = useGoogleMapContext();

    const mapRef = React.useRef<HTMLDivElement>(null);

    const mapInstance = React.useMemo(() => {
        // const station = id ? getStation(db, id) : null;
        // let isChanged: boolean;

        return googleMaps.then(({ Map, Marker, LatLng }) => {
            if (!mapRef.current) return;
            const zoom = 15;
            const { latitude, longitude } = defaultRegion;
            const center = new LatLng(latitude, longitude);

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

            // const marker = new Marker({ map });

            // const mark = () => {
            //     if (!isChanged) return isChanged = true;
            //     const position = map.getCenter()?.toJSON()!;
            //     marker.setPosition(position);
            //     setLocation(new GeoPoint(position.lat, position.lng));
            //     setLocated(false);
            // };

            // map.addListener('center_changed', mark);
            // map.addListener('zoom_changed', mark);

            // const locate = async () => {
            //     const { coords } = await Geolocation.getCurrentPosition();
            //     const center = new LatLng(coords.latitude, coords.longitude);
            //     map.moveCamera({ center, zoom });
            //     marker.setPosition(center);
            // }

            // if (station) {
            //     station.then(documentSnapshot => {
            //         const { name, location, address } = documentSnapshot.data()!;
            //         const { latitude, longitude } = location;
            //         const center = new LatLng(latitude, longitude);

            //         setValue('name', name);
            //         setValue('address', address);

            //         map.moveCamera({ center, zoom });
            //         marker.setPosition(center);
            //     });
            // } else {
            //     window.fetch('https://ipapi.co/json/', { cache: 'force-cache' }).then(response => {
            //         response.json().then(({ latitude, longitude }: IPRegion) => {
            //             if (!latitude || !longitude || location !== defaultRegion) return;
            //             map.setCenter(new LatLng(latitude, longitude));
            //         });
            //     });
            // }

            // return {
            //     locate,
            // };
        });
    }, [mapRef]);

    return (
        <div ref={mapRef} style={{
            width: '100%',
            height: '100%'
        }} />
    )
});

export default StationMap;
