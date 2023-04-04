import React from 'react';
import { h3SetToFeatureCollection, h3ToFeature } from 'geojson2h3';
import { useGoogleMapContext as useGoogleMapsContext } from '../../contexts/GoogleMap';
import { Coordinates, useLocationContext } from '../../contexts/Location';
import { AssetsByStation, useAssetContext } from '../../contexts/Asset';
import { Asset } from '../../utils/db/asset';
import { cellToBoundary, cellToLatLng, CoordPair, getResolution, greatCircleDistance, gridDisk, H3Index, UNITS } from 'h3-js';
import { Feature, Geometry, Polygon, Position } from 'geojson';
import './Map.css';
import { h3ResolutionLocation, h3ResolutionMax, h3RingSize, locationDebounce } from '../../config';
import { CreateAnimation, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { useThemeContext } from '../../contexts/Theme';
import { cellFillColor, cellFillOpacity, cellStrokeColorToken, cellStrokeWeight, cellZIndex, styleCell, styleCellLabel, styleMap, styleMarker } from './style';
import { initializeRef } from '../../utils/hooks/intializeRef';
import { Stations, useStationContext } from '../../contexts/Station';
import { ColorTheme, Token } from '../../theme/theme';
import { cellLabel, cellPolygon, getProperty, Property, setProperty } from '../../utils/mapData';

export interface View {
    center?: string[] | boolean;
    padding?: number;
}

const zoomRange = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;
const maxZoom = zoomRange[zoomRange.length - 1];
const minZoom = zoomRange[0];

export enum MarkerColor {
    Primary = 'lightgreen',
    Warning = 'tomato',
    Disabled = 'lightgrey'
}

interface Props {
    // center?: string[];
    // filter?: boolean;
    // padding?: number;
    aggregate?: boolean;
    center?: Coordinates;
    centerLocation?: boolean;
    centerMarker?: MarkerColor;
    draggable?: boolean;
    grid?: boolean;
    height?: string;
    locationCell?: boolean;
    positionMarker?: boolean;
    scope?: boolean;
    view?: View;
    zoom?: typeof zoomRange[number];
    // onBlur?: () => void;
    onClick?: () => void;
    onFocus?: (id: string) => void;
    // hideStation: () => void;
    onDrag?: () => void;
}

const pinPath = 'm24 12c-0.19 3.3-1.8 6.3-3.2 9.3-2.6 5.1-5.6 10-8.8 15-4-5.9-7.8-12-11-19-1.1-2.5-1.8-5.3-1.1-8.1 1.1-5.3 6.3-9.4 12-9.3 5.4-0.1 11 4 12 9.3 0.21 0.89 0.31 1.8 0.31 2.7z';

// const randomColor = () => {
//     const goldenAngle = 180 * (3 - Math.sqrt(5));
//     return `hsl(${Math.random() * 10 * goldenAngle + 60}, 100%, ${Math.round(Math.random() * 100)}%)`;
// };

const noSymbol: google.maps.Icon = {
    // fillOpacity: 0,
    // strokeOpacity: 0,
    // path: 2,
    url: '/assets/1x1.gif'
};

const positionSymbol: google.maps.Symbol = {
    path: 2,
    fillColor: 'royalblue',
    fillOpacity: 1,
    strokeWeight: 10,
    strokeOpacity: 0.2,
    scale: 5,
    strokeColor: 'royalblue',
};

const pinSymbol = (
    Point: typeof google.maps.Point,
    color?: boolean | string
) => {
    const anchor = new Point(12, 36);
    const labelOrigin = new Point(12, 12);
    const symbol: google.maps.Symbol = {
        anchor,
        fillColor: color === true ? 'lightgreen' : color || 'lightgrey',
        fillOpacity: 1,
        labelOrigin,
        path: pinPath,
        strokeWeight: 1,
        strokeOpacity: 0.2
    };
    return symbol;
};


const cellLabelStyle = (
    color: ColorTheme,
    label: string | number,
): google.maps.Data.StyleOptions => {
    return {
        icon: noSymbol,
        label: {
            text: '' + label,
            color: color[Token.MonoLow4],
            className: 'cellLabel',
            fontSize: '2.5vmin',
        },
        opacity: label !== null ? 1 : 0,
        zIndex: 5,
    };
}

const addCells = (
    map: google.maps.Map | undefined,
    h3Index: H3Index,
    h3Resolution: number,
) => {
    map?.data.addGeoJson({
        type: 'FeatureCollection',
        features: gridDisk(h3Index, h3RingSize).reduce((
            features: Feature[],
            h3RingIndex,
            index,
        ) => {
            const feature = map.data.getFeatureById(h3RingIndex);
            if (feature) return features;
            console.log('addCell', index, h3RingIndex);
            features.push(cellPolygon(h3RingIndex, cellToBoundary(h3RingIndex, true), {
                [Property.Index]: h3RingIndex,
                [Property.Resolution]: h3Resolution,
                [Property.IsLocation]: h3Index === h3RingIndex
            }));

            features.push(cellLabel(cellToLatLng(h3RingIndex), {
                [Property.Index]: h3RingIndex,
                [Property.Resolution]: h3Resolution,
                [Property.Label]: ' ',
            }));

            return features;
        }, [])
    });
}

const addMarkers = (
    map?: google.maps.Map,
    assetsByStation?: AssetsByStation,
    stations?: Stations,
) => {
    if (!map || !assetsByStation || !stations) return;
    const features: Feature[] = [];

    for (const stationId in assetsByStation) {
        const station = stations[stationId];
        if (!station) continue;

        const { h3Index, location: { latitude, longitude } } = station;
        const count = assetsByStation[stationId];
        const resolution = getResolution(h3Index);

        // if (onFocus) {
        //     newmarker.addListener('click', () => onFocus(stationId));
        // }

        console.log('station', { count })
        features.push(cellLabel([ latitude, longitude ], {
            [Property.Resolution]: resolution,
            [Property.Label]: count,
            [Property.Index]: stationId,
            [Property.IsMarker]: true,
        }))
    }

    map.data.addGeoJson({
        type: 'FeatureCollection',
        features,
    });
}

const Map = React.memo<Props>(({
    aggregate,
    center,
    draggable = true,
    locationCell,
    centerLocation = true,
    centerMarker,
    positionMarker,
    grid = true,
    height = '100%',
    scope = true,
    view,
    zoom,
    onClick,
    onFocus,
    onDrag,
}) => {
    const { location, position, setLocation, setScope } = useLocationContext();
    const { assetsByLocation, assetsByStation } = useAssetContext();
    const { stations } = useStationContext();
    const googleMaps = useGoogleMapsContext();
    const { color } = useThemeContext();

    const styles = React.useMemo(() => styleMap(color), [color]);

    const { coordinates, diameter, h3IndexMax, h3Index, h3Resolution } = location;

    // React.useEffect(() => {
    //     if (live) setCenter(location.coordinates);
    // }, [live, location.coordinates]);

    // window.fetch('https://ipapi.co/json/', { cache: 'force-cache' }).then(response => {
    //     response.json().then(({ latitude, longitude }: IPRegion) => {
    //         if (!latitude || !longitude || location !== defaultRegion) return;
    //         map.setCenter(new LatLng(latitude, longitude));
    //     });
    // });

    const mapRef = React.useRef<google.maps.Map>();
    const centerMarkerRef = React.useRef<google.maps.Marker>();
    const positionMarkerRef = React.useRef<google.maps.Marker>();
    const assetMarkersRef = React.useRef<Record<string, google.maps.Marker>>({});

    // const [isZooming, setZooming] = React.useState(false);
    
    console.log('renderMap', { zoom });

    const createRef = React.useCallback(async (
        mapElement: HTMLDivElement | null,
    ) => {
        if (!mapElement) return;
        const { Circle, LatLng, LatLngBounds, Point } = await googleMaps;

        const map = new google.maps.Map(mapElement, {
            // mapId: process.env.REACT_APP_GOOGLE_API_KEY,
            center: center && new LatLng(...center),
            draggable,
            zoom,
            maxZoom,
            minZoom,
            disableDefaultUI: true,
            styles,
            keyboardShortcuts: false,
            backgroundColor: color[Token.MonoLow1],
        });

        if (!center) {
            const [lat, lng] = coordinates;
            const circle = new Circle({
                center: { lat, lng },
                radius: diameter / 2 * 1000,
            });
            const bounds = new LatLngBounds(circle.getBounds());
            console.log('fitBounds', bounds)
            !zoom
                ? map.fitBounds(bounds)
                : map.moveCamera({
                    center: bounds.getCenter(),
                    zoom,
                });
        }

        addCells(map, h3Index, h3Resolution);
        addMarkers(mapRef.current, assetsByStation, stations);

        mapRef.current = map;

        positionMarkerRef.current?.setMap(map);
        centerMarkerRef.current?.setMap(map);

        // const { current: assetMarkers } = assetMarkersRef;
        // for (const key in assetMarkers) {
        //     assetMarkers[key].setMap(map);
        // }

        map.data.setStyle(feature => {
            const label = getProperty(feature, Property.Label);
            if (label !== undefined) {
                const isMarker = feature.getProperty(Property.IsMarker);
                if (isMarker) return styleMarker(label, color);
                // return isMarker
                //     ? markerStyle(pinSymbol(Point, true))
                //     : cellLabelStyle(color, label);
                return styleCellLabel(label, color);
            }

            return styleCell(feature, color);
            
        });

        let locationTimeout: number;
        let locationInit: boolean;
    
        map.addListener('bounds_changed', () => {
            if (!zoom && !center && !locationInit) return locationInit = true;
            window.clearTimeout(locationTimeout);
            locationTimeout = window.setTimeout(() => {
                const bounds = map.getBounds();
                const center = bounds?.getCenter();
                if (!bounds || !center) return;

                const coordinates: [number, number] = [center.lat(), center.lng()];
                const northEast = bounds?.getNorthEast();
                const southWest = bounds?.getSouthWest();
                const diameter = greatCircleDistance(
                    [northEast.lat(), northEast.lng()],
                    [southWest.lat(), southWest.lng()],
                    UNITS.km
                );
                console.log('idle', coordinates, diameter)
                setLocation({ coordinates, diameter });
                // setScope(scope);
    
                centerMarkerRef.current?.setPosition(new LatLng(...coordinates))
            }, locationDebounce);
        });

        map.addListener('click', () => onClick && onClick());
        map.addListener('dragend', () => onDrag && onDrag());
    }, [
        center,
        color,
        googleMaps,
        zoom,
    ]);

    // Set map zoom
    React.useEffect(() => {
        if (!zoom) return;
        mapRef.current?.setZoom(zoom);
    }, [
        zoom,
    ]);

    // Set map center
    React.useEffect(() => {
        if (!center) return;
        const [lat, lng] = center;
        mapRef.current?.setCenter({ lat, lng });
    }, [
        center,
    ]);

    const h3IndexMaxRef = React.useRef<H3Index>(h3IndexMax);

    // Set max resolution location cell
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!map) return;

        const feature = map.data.getFeatureById(h3IndexMaxRef.current);
        if (feature) map.data.remove(feature);

        if (!locationCell || h3Resolution <= h3ResolutionLocation) return;
        const polygon = cellToBoundary(h3IndexMax, true);
        h3IndexMaxRef.current = h3IndexMax;
        map.data.addGeoJson(cellPolygon(h3IndexMax, polygon, {
            [Property.Index]: h3IndexMax,
            [Property.IsLocation]: true,
            [Property.Resolution]: h3ResolutionMax,
        }));
    }, [
        locationCell,
        h3IndexMax,
        h3Resolution,
    ]);

    const h3IndexRef = React.useRef<H3Index>(h3Index);

    // Set actual location cell
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!map) return;

        map.data.getFeatureById(h3Index)?.setProperty(Property.IsLocation, true);
        map.data.getFeatureById(h3IndexRef.current)?.removeProperty(Property.IsLocation);
        h3IndexRef.current = h3Index;
    }, [
        h3Index,
    ]);

    // Remove cells
    React.useEffect(() => {
        const { current: map } = mapRef;
        map?.data.forEach(feature => {
            const isAsset = getProperty(feature, Property.IsAsset);
            const isLocation = getProperty(feature, Property.IsLocation);
            const resolution = getProperty(feature, Property.Resolution);
            const isAggregate = resolution <= h3ResolutionLocation;

            if (grid) {
                if (!isAggregate && (isAsset || isLocation)) return;
                if (resolution === h3Resolution) return;
            }

            map.data.remove(feature);
        });
    }, [
        grid,
        h3Resolution,
    ]);

    // Add cells
    React.useEffect(() => {
        if (!grid) return;
        addCells(mapRef.current, h3Index, h3Resolution);
    }, [
        grid,
        h3Index,
        h3Resolution,
    ]);

    // Set aggregate cell properties
    React.useEffect(() => {
        if (!aggregate || !grid || !scope) return;
        mapRef.current?.data.forEach(feature => {
            const index = getProperty(feature, Property.Index);
            const label = getProperty(feature, Property.Label);
            const resolution = getProperty(feature, Property.Resolution);
            const count = assetsByLocation.cells[index];
            const max = assetsByLocation.max;

            if (count === undefined) return;

            if (label !== undefined) {
                if (resolution > h3ResolutionLocation) return;
                if (label !== count && count > 0) setProperty(feature, Property.Label, count);
            } else {
                const assetsCount = getProperty(feature, Property.AssetsCount);
                const assetsMax = getProperty(feature, Property.AssetsMax);
                if (assetsCount !== count) setProperty(feature, Property.AssetsCount, count);
                if (assetsMax !== max) setProperty(feature, Property.AssetsMax, max);
            }
        });
    }, [
        aggregate,
        grid,
        scope,
        assetsByLocation,
    ]);

    React.useEffect(() => {
        if (!scope) return;
        addMarkers(mapRef.current, assetsByStation, stations);
    }, [
        scope,
        stations,
        assetsByStation,
    ]);

    // React.useEffect(() => {
    //     if (!googleMaps || !map || !vehicles || !view) return;
    //     // focus(view);
    // }, [googleMaps, map, vehicles, view]);

    const locateAnimationRef = React.createRef<CreateAnimation>();

    // const focus = React.useCallback(())
    const locateButton = React.useMemo(() => {
        return (
            <IonFabButton
                // color={isLocated ? 'light' : 'medium'}
                color="medium"
                size="small"
            // onClick={locate}
            >
                <CreateAnimation
                    ref={locateAnimationRef}
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
    }, []);

    return (
        <div className="mapContainer" style={{ height }}>
            <div
                ref={createRef}
                role="application"
                className="map"
            />
            <IonFab vertical="bottom" horizontal="end">
                {locateButton}
            </IonFab>
        </div>
    )
});

Map.displayName = 'Map';

export {
    Map
};
