import React from 'react';
import { defaultRegion } from '../../config';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { useLocationContext } from '../../contexts/Location';
import { useStationContext } from '../../contexts/Station';
import { useVehicleContext } from '../../contexts/Vehicle';
import { Vehicle } from '../../utils/db/vehicle';
import { style } from '../../utils/map/style';

interface Props {
    center?: string[];
    padding?: number;
    onBlur?: () => void;
    onClick?: () => void;
    onFocus?: (id?: string) => void;
    // hideStation: () => void;
}

const vehicleCount = (
    vehicles?: Record<string, Vehicle>,
    stationId?: string,
) => {
    if (!vehicles || !stationId) return;
    return Object.keys(vehicles).reduce((label, vehicleId) => {
        if (vehicles[vehicleId].station.id == stationId) label += 1;
        return label;
    }, 0).toString();
}

const StationMap = React.memo<Props>(({
    center,
    padding,
    onBlur,
    onClick,
    onFocus,
}) => {
    const { location, setLocation } = useLocationContext();
    const { googleMaps } = useGoogleMapContext();
    const { stations } = useStationContext();
    const { vehicles } = useVehicleContext();
    // console.log('map');
    // console.log('stations', stations, vehicles);

    const [ map, setMap ] = React.useState<google.maps.Map>();
    const mapRef = React.useRef<HTMLDivElement>(null);

    const [focus, setFocus] = React.useState<'position' | string>();

    React.useEffect(() => {
        googleMaps.then(({ Map, Marker, LatLng, Point }) => {
            if (!mapRef.current) return;

            const [latitude, longitude] = location || defaultRegion;
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
                // onFocus && onFocus();
                console.log('click');
                onClick && onClick();
            })

            map.addListener('idle', () => {
                const center = map.getCenter();
                if (!center) return;
                console.log('idle');
                setLocation([center.lat(), center.lng()]);
                setFocus(undefined);
            });

            // map.addListener('center_changed', () => {
            //     console.log('center cahnged');
            //     onBlur && onBlur();
            // })

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
        
        for (const stationId in markers.current) {
            const marker = markers.current[stationId];
            if (stations[stationId]) {
                if (marker.getMap() !== map) {
                    marker.setMap(map);
                }
                if (vehicles) {
                    const label = vehicleCount(vehicles, stationId);
                    if (marker.getLabel() !== label) marker.setLabel(label);
                }
                continue;
            }
            console.log('delete marker', stationId)
            markers.current[stationId].setMap(null);
            delete markers.current[stationId];
        }

        googleMaps.then(({ LatLng, LatLngBounds, Marker, Animation }) => {
            const bounds = new LatLngBounds();

            for (const stationId in stations) {
                const { location } = stations[stationId];
                const position = new LatLng(location.latitude, location.longitude);
                const marker = markers.current[stationId];

                bounds.extend(position);

                if (!marker) {
                    const label = vehicleCount(vehicles, stationId);
                    const newMarker = new Marker({
                        map,
                        position,
                        label,
                        animation: Animation.DROP,
                    });
                    onFocus && newMarker.addListener('click', () => {
                        map.setCenter(position);
                        map.panBy(0, 100);
                        setFocus(stationId);
                        onFocus(stationId);
                    });
                    markers.current[stationId] = newMarker;
                    continue;
                }

                if (!marker.getPosition()?.equals(position)) {
                    marker.setPosition(position);
                }
            }

            if (!bounds.isEmpty()) map.fitBounds(bounds, {
                left: 50, top: 50, right: 50,
                bottom: padding,
            })
        });
    }, [map, stations, vehicles]);

    // React.useEffect(() => {
    //     if (!map || !focus) return;
    //     if (focus === 'bounds') {
    //         googleMaps.then(({ LatLngBounds }) => {
    //             const bounds = new LatLngBounds();
    //             for (const stationId in markers.current) {
    //                 const marker = markers.current[stationId];
    //                 const position = marker.getPosition();
    //                 if (position) bounds.extend(position);
    //             }
    //             if (!bounds.isEmpty()) {
    //                 map.fitBounds(bounds, {
    //                     bottom: padding,
    //                 })
    //             }
    //         });
    //     }
    // }, [map, focus]);

    React.useEffect(() => {
        if (!map || !center || !center.length) return;
        if (center.length === 1 && center[0] === focus) {
            const marker = markers.current[center[0]];
            const position = marker.getPosition();
            if (position) {
                map.panTo(position);
                if (padding) map.panBy(0, padding);
            }
            return;
        }
        // googleMaps.then(({ LatLngBounds }) => {
        //     const bounds = new LatLngBounds();
        //     center.forEach(id => {
        //         const marker = markers.current[id];
        //         if (marker) {
        //             const position = marker.getPosition();
        //             if (position) bounds.extend(position);
        //         }
        //     });
        //     if (!bounds.isEmpty()) map.fitBounds(bounds, {
        //         bottom: padding,
        //     })
        // });
    }, [map, focus, center, padding]);

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