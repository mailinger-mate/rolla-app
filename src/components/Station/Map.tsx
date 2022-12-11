import React from 'react';
import { defaultRegion } from '../../config';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { useLocationContext } from '../../contexts/Location';
import { useStationContext } from '../../contexts/Station';
import { useVehicleContext } from '../../contexts/Vehicle';
import { Vehicle } from '../../utils/db/vehicle';
import { style } from '../../utils/map/style';

export interface View {
    center?: string[] | boolean;
    padding?: number;
}

interface Props {
    center?: string[];
    filter?: boolean;
    padding?: number;
    view?: View;
    // onBlur?: () => void;
    onClick?: () => void;
    onFocus?: (id: string) => void;
    // hideStation: () => void;
    onDrag?: () => void;
}

const pinPath = 'm24 12c-0.19 3.3-1.8 6.3-3.2 9.3-2.6 5.1-5.6 10-8.8 15-4-5.9-7.8-12-11-19-1.1-2.5-1.8-5.3-1.1-8.1 1.1-5.3 6.3-9.4 12-9.3 5.4-0.1 11 4 12 9.3 0.21 0.89 0.31 1.8 0.31 2.7z';

const vehicleCount = (
    vehicles?: Record<string, Vehicle>,
    stationId?: string,
) => {
    if (!vehicles || !stationId) return;
    return Object.keys(vehicles).reduce((label, vehicleId) => {
        if (vehicles[vehicleId].station.id == stationId) label += 1;
        return label;
    }, 0);
}

const StationMap = React.memo<Props>(({
    view,
    onClick,
    onFocus,
    onDrag,
}) => {
    const { location, setLocation } = useLocationContext();
    const { stations } = useStationContext();
    const { vehicles } = useVehicleContext();
    const googleMaps = useGoogleMapContext();

    // console.log('map');
    // console.log('stations', stations, vehicles);

    // const [ map, setMap ] = React.useState<google.maps.Map>();
    const mapRef = React.useRef<HTMLDivElement>(null);

    // const [focus, setFocus] = React.useState<'position' | 'view'>();

    // const focus = React.useRef<'position' | 'center'>();

    const map = React.useMemo(() => {
        if (!mapRef.current || !googleMaps) return;
        const { Map, Marker, LatLng, Point } = googleMaps;

        const [latitude, longitude] = location || defaultRegion;
        const center = new LatLng(latitude, longitude);

        const map = new Map(mapRef.current, {
            center,
            zoom: 13,
            maxZoom: 16,
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
            onClick && onClick();
        })

        map.addListener('idle', () => {
            const center = map.getCenter();
            if (!center) return;
            setLocation([center.lat(), center.lng()]);
        });

        map.addListener('dragend', () => {
            onDrag && onDrag();
        })

        // map.addListener('center_changed', () => {
        //     console.log('center cahnged');
        //     onBlur && onBlur();
        // })

        // setMap(map);

        return map;

        // new Marker().setValues()
    }, [googleMaps, mapRef]);

    // const markers = 

    // const [ markers, setMarkers ] = React.useState<Record<string, google.maps.Marker>>({});

    const markers = React.useRef<Record<string, google.maps.Marker>>({});

    const focus = React.useCallback((view: View) => {
        if (!googleMaps || !map || !markers || !view) return;
        const { center, padding } = view;
        if (!center) return;
        // if (!center && padding) {
        //     map.panBy(0, padding);
        // }

        const { LatLngBounds } = googleMaps;
        let bounds = new LatLngBounds();

        if (Array.isArray(center)) {
            center.forEach(id => {
                const position = markers.current[id]?.getPosition();
                if (position) bounds.extend(position);
            });
        } else {
            for (const stationId in markers.current) {
                const position = markers.current[stationId]?.getPosition();
                if (position) bounds.extend(position);
            }
        }

        if (bounds.isEmpty()) return;

        map.fitBounds(bounds);
        padding && map.panBy(0, Math.round(padding * document.body.clientHeight / 2))
        // setFocus('view');
    }, [googleMaps, map]);

    const pinSymbol = React.useCallback((count?: number) => {
        if (!googleMaps) return;
        const { Point } = googleMaps;
        const anchor = new Point(12, 46);
        const labelOrigin = new Point(12, 12);
        const symbol: google.maps.Symbol = {
            anchor,
            fillColor: count ? 'lightgreen' : 'lightgrey',
            fillOpacity: 1,
            labelOrigin,
            path: pinPath,
            strokeWeight: 0,
        }
        return symbol;
    }, [googleMaps])

    React.useEffect(() => {
        if (!map || !stations || !googleMaps) return;

        console.log('markers', markers.current);

        for (const stationId in markers.current) {
            const marker = markers.current[stationId];
            if (stations[stationId]) {
                if (marker.getMap() !== map) {
                    marker.setMap(map);
                }
                if (vehicles) {
                    const label = vehicleCount(vehicles, stationId);
                    if (marker.getLabel() !== label) marker.setLabel(label?.toString());
                }
                continue;
            }
            console.log('delete marker', stationId)
            marker.setMap(null);
            delete markers.current[stationId];
        }

        const { LatLng, LatLngBounds, Marker, Animation, Point, Size } = googleMaps;
        // const { center, padding } = view || {};

        // const bounds = new LatLngBounds();

        for (const stationId in stations) {
            const { location } = stations[stationId];
            const position = new LatLng(location.latitude, location.longitude);
            const marker = markers.current[stationId];

            // if (center && (center === true || center.indexOf(stationId) >= 0)) {
            //     bounds.extend(position);
            // }

            if (marker) {
                if (!marker.getPosition()?.equals(position)) marker.setPosition(position);
                continue;
            }

            const count = vehicleCount(vehicles, stationId);

            const newmarker = new Marker({
                map,
                position,
                label: count ? count.toString() : '?',
                animation: Animation.DROP,
                icon: pinSymbol(count)
            });

            if (onFocus) {
                newmarker.addListener('click', () => onFocus(stationId));
            }

            markers.current[stationId] = newmarker;
        }

        // if (!bounds.isEmpty()) {
        //     map.fitBounds(bounds, {
        //         left: 50, top: 50, right: 50,
        //         bottom: padding,
        //     });
        // }

    }, [googleMaps, map, stations, vehicles]);

    React.useEffect(() => {
        if (!googleMaps || !map || !stations || !view) return;
        focus(view);
    }, [googleMaps, map, stations, view]);

    // const focus = React.useCallback(())

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