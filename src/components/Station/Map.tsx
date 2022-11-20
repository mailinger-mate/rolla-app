import React from 'react';
import { defaultRegion } from '../../config';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { useStationContext } from '../../contexts/Station';
import { style } from '../../utils/map/style';

interface Props {
    selectStation: (id?: string) => void;
    // hideStation: () => void;
}

const StationMap = React.memo<Props>(({
    selectStation,
}) => {
    const { googleMaps } = useGoogleMapContext();
    const { setLocation, stations } = useStationContext();
    // console.log('map');
    // console.log('stations', stations, vehicles);

    const [ map, setMap ] = React.useState<google.maps.Map>();
    const mapRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        googleMaps.then(({ Map, Marker, LatLng, Point }) => {
            if (!mapRef.current) return;

            const { latitude, longitude } = defaultRegion;
            const center = new LatLng(latitude, longitude);

            const map = new Map(mapRef.current, {
                center,
                zoom: 14,
                // zoom: 6,
                // minZoom: 4,
                disableDefaultUI: true,
                styles: style,
                keyboardShortcuts: false,
                backgroundColor: 'transparent',
                // gestureHandling: 'cooperative',
                // restriction: {
                //     latLngBounds: {
                //         north: 22,
                //         south: 5,
                //         west: 95,
                //         east: 107,
                //     },
                // }
            });

            map.addListener('click', () => {
                selectStation();
            })

            map.addListener('idle', () => {
                const center = map.getCenter();
                if (!center) return;
                setLocation([center.lat(), center.lng()]);
            });

            setMap(map);

            // new Marker().setValues()
        });
    }, [mapRef]);

    // const markers = 

    // const [ markers, setMarkers ] = React.useState<Record<string, google.maps.Marker>>({});

    const markers = React.useRef<Record<string, google.maps.Marker>>({});

    React.useEffect(() => {
        if (!map || !stations) return;

        console.log('markers', markers.current);
        
        for (const id in markers.current) {
            if (stations[id]) continue;
            console.log('delete marker', id)
            markers.current[id].setMap(null);
            delete markers.current[id];
        }

        googleMaps.then(({ LatLng, Marker }) => {
            for (const id in stations) {
                const { location } = stations[id];
                const position = new LatLng(location.latitude, location.longitude);
                const marker = markers.current[id];

                if (!marker) {
                    const newMarker = new Marker({
                        map,
                        position,
                    });
                    newMarker.addListener('click', () => selectStation(id));
                    markers.current[id] = newMarker;
                    continue;
                }

                if (!marker.getPosition()?.equals(position)) {
                    marker.setPosition(position);
                }
            }
        });
    }, [map, stations]);

    return (
        <div
            ref={mapRef}
            role="application"
            style={{
                width: '100%',
                height: '100%'
            }}
        />
    )
});

StationMap.displayName = 'StationMap';

export {
    StationMap
};