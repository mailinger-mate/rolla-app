import React from 'react';
import { h3SetToFeatureCollection, h3ToFeature } from 'geojson2h3';
import { useGoogleMapContext as useGoogleMapsContext } from '../../contexts/GoogleMap';
import { Coordinates, useLocationContext } from '../../contexts/Location';
import { useAssetContext } from '../../contexts/Asset';
import { Asset } from '../../utils/db/asset';
import { cellToBoundary, cellToLatLng, CoordPair, greatCircleDistance, gridDisk, H3Index, UNITS } from 'h3-js';
import { Feature, Geometry, Polygon, Position } from 'geojson';
import './Map.css';
import { h3ResolutionLocation, h3ResolutionMax, h3RingSize, locationDebounce } from '../../config';
import { CreateAnimation, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { Token, useThemeContext } from '../../contexts/Theme';
import { cellFillColor, cellFillOpacity, cellStrokeColorToken, cellStrokeWeight, cellZIndex, styleMap } from './style';
import { initializeRef } from '../../utils/hooks/intializeRef';

export interface View {
    center?: string[] | boolean;
    padding?: number;
}

const zoomRange = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const;

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
    drag?: boolean;
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


enum Property {
    IsLocation = 'isLocation',
    IsAsset = 'isAsset',
    AssetsCount = 'assetsCount',
    AssetsMax = 'assetsMax',
    Index = 'index',
    Label = 'label',
    Resolution = 'resolution',
}

interface FeatureProperties {
    [Property.AssetsCount]?: number;
    [Property.AssetsMax]?: number;
    [Property.IsAsset]?: boolean;
    [Property.IsLocation]?: boolean;
    [Property.Resolution]: number;
}

export interface CellProperties extends FeatureProperties {
    isAggregate?: boolean;
    [Property.IsLocation]?: boolean;
    [Property.Index]: string;
}

interface CellLabelProperties {
    [Property.Label]: number | string;
    [Property.Index]: string;
    [Property.Resolution]: number;
}

function setCellLabelProperty<K extends keyof CellLabelProperties>(
    feature: google.maps.Data.Feature | undefined,
    key: K,
    value: CellLabelProperties[K]
) {
    if (!feature) return;
    feature.setProperty(key, value);
}

const cellLabelProperties = (
    feature: google.maps.Data.Feature
): CellLabelProperties => {
    const index = feature.getProperty(Property.Index);
    const label = feature.getProperty(Property.Label);
    const resolution = feature.getProperty(Property.Resolution);

    return {
        index,
        label,
        resolution,
    };
}

const cellLabelFeature = (
    [longitude, latitude]: CoordPair,
    properties: CellLabelProperties,
): Feature => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [latitude, longitude],
        },
        properties,
    };
}


function setCellProperty<K extends keyof FeatureProperties>(
    feature: google.maps.Data.Feature | undefined,
    key: K,
    value: FeatureProperties[K]
) {
    if (!feature) return;
    feature.setProperty(key, value);
}

const cellProperties = (
    feature: google.maps.Data.Feature
): CellProperties => {
    const index = feature.getId() || feature.getProperty(Property.Index);
    // const label = feature.getProperty(Property.Label);
    const assetsCount = feature.getProperty(Property.AssetsCount);
    const assetsMax = feature.getProperty(Property.AssetsMax);
    const resolution = feature.getProperty(Property.Resolution);
    const isAggregate = resolution <= h3ResolutionLocation;
    const isAsset = feature.getProperty(Property.IsAsset) || false;
    const isLocation = feature.getProperty(Property.IsLocation) || false;
    
    return {
        assetsCount,
        assetsMax,
        index,
        isAggregate,
        isAsset,
        isLocation,
        // label,
        resolution,
    }
}

const cellPolygonFeature = (
    h3Index: string,
    coordinates: CoordPair[],
    properties: FeatureProperties,
): Feature => {
    return {
        type: 'Feature',
        id: h3Index,
        geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
        },
        properties,
    }
}

const animationFramerate = 1 / 20;
const cellCenterId = 'Center';
const pinPath = 'm24 12c-0.19 3.3-1.8 6.3-3.2 9.3-2.6 5.1-5.6 10-8.8 15-4-5.9-7.8-12-11-19-1.1-2.5-1.8-5.3-1.1-8.1 1.1-5.3 6.3-9.4 12-9.3 5.4-0.1 11 4 12 9.3 0.21 0.89 0.31 1.8 0.31 2.7z';

const vehicleCount = (
    vehicles?: Record<string, Asset>,
    stationId?: string,
) => {
    if (!vehicles || !stationId) return;
    return Object.keys(vehicles).reduce((label, vehicleId) => {
        if (vehicles[vehicleId].station.id == stationId) label += 1;
        return label;
    }, 0);
}

const randomColor = () => {
    const goldenAngle = 180 * (3 - Math.sqrt(5));
    return `hsl(${Math.random() * 10 * goldenAngle + 60}, 100%, ${Math.round(Math.random() * 100)}%)`;
};

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

const Map = React.memo<Props>(({
    aggregate,
    center,
    drag = true,
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
    ...props
}) => {
    const { location, position, setLocation, setScope } = useLocationContext();
    // const { stations } = useStationContext();
    const { vehicles, vehiclesAggregate } = useAssetContext();
    const googleMaps = useGoogleMapsContext();
    const { color } = useThemeContext();

    // const [map, setMap] = React.useState<google.maps.Map>();


    const { coordinates, h3IndexMax, h3Index, h3Resolution } = location;

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
    const mapElementRef = React.useRef<HTMLDivElement>(null);

    const centerMarkerRef = React.useRef<google.maps.Marker>();
    const positionMarkerRef = React.useRef<google.maps.Marker>();
    const assetMarkersRef = React.useRef<Record<string, google.maps.Marker>>({});

    // const [isZooming, setZooming] = React.useState(false);
    
    console.log('renderMap');

    React.useEffect(() => {
        if (!googleMaps || !mapElementRef.current) return;
        const { Circle, Marker, LatLng, LatLngBounds } = googleMaps;

        const map = new google.maps.Map(mapElementRef.current, {
            center: center && new LatLng(...center),
            draggable: drag,
            zoom,
            maxZoom: zoomRange[zoomRange.length - 1],
            // zoom: 6,
            minZoom: zoomRange[0],
            disableDefaultUI: true,
            styles: styleMap(color),
            keyboardShortcuts: false,
            backgroundColor: color(Token.MonoLow1),
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

        mapRef.current = map;

        positionMarkerRef.current?.setMap(map);
        centerMarkerRef.current?.setMap(map);

        const { current: assetMarkers } = assetMarkersRef;
        for (const key in assetMarkers) {
            assetMarkers[key].setMap(map);
        }

        if (!center) {
            const [lat, lng] = location.coordinates;
            const circle = new Circle({
                center: { lat, lng },
                radius: location.diameter / 2 * 1000,
            });
            const bounds = new LatLngBounds(circle.getBounds())
            map.fitBounds(bounds);
        }

        map.data.setStyle((feature) => {
            const id = feature.getId();
            if (!id) {
                const { label } = cellLabelProperties(feature);
                return {
                    icon: noSymbol,
                    label: {
                        text: '' + label,
                        color: color(Token.MonoLow4),
                        className: 'cellLabel',
                        fontSize: '2.5vmin',
                    },
                    opacity: label !== null ? 1 : 0,
                    zIndex: 5,
                };
            }
            
            const properties = cellProperties(feature);
            const fillColor = cellFillColor(properties);
            const { isAggregate } = properties;

            return {
                strokeColor: !isAggregate && fillColor || color(cellStrokeColorToken(properties)),
                strokeWeight: cellStrokeWeight(properties),
                strokeOpacity: 0.5,
                fillOpacity: cellFillOpacity(properties),
                fillColor: fillColor || color(Token.MonoLow2),
                zIndex: cellZIndex(properties),
            };
        });

        let locationTimeout: number;
    
        map.addListener('bounds_changed', () => {
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
                setScope(scope);
    
                centerMarkerRef.current?.setPosition(new LatLng(...coordinates))
            }, locationDebounce);
        });

        map.addListener('click', () => onClick && onClick());
        map.addListener('dragend', () => onDrag && onDrag());

    }, [googleMaps, mapElementRef, color]);

    // Set position marker
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!googleMaps || !position || !map) return;

        const { LatLng, Marker } = googleMaps;

        initializeRef(
            positionMarkerRef,
            new Marker({
                map,
                icon: positionSymbol
            })
        ).current
            ?.setPosition(new LatLng(...position));
    }, [
        googleMaps,
        position,
    ]);

    const pinSymbol = React.useCallback((color?: boolean | string) => {
        if (!googleMaps) return;
        const { Point } = googleMaps;
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
    }, [googleMaps]);

    // Set center marker
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!googleMaps || !map) return;
        const { Marker } = googleMaps;

        initializeRef(
            centerMarkerRef,
            new Marker({
                icon: pinSymbol(centerMarker),
                map,
            })
        ).current
            ?.setVisible(!!centerMarker);
    }, [
        centerMarker,
        googleMaps,
        // map,
    ]);

    // Set map center
    React.useEffect(() => {
        if (!mapRef.current || !center) return;
        const [lat, lng] = center;
        mapRef.current.setCenter({ lat, lng });
    }, [
        center,
    ]);

    const h3IndexMaxRef = React.useRef<H3Index>(h3IndexMax);

    // Set max location cell feature
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!map) return;

        const feature = map.data.getFeatureById(h3IndexMaxRef.current);
        if (feature) map.data.remove(feature);

        if (!locationCell || h3Resolution <= h3ResolutionLocation) return;
        const polygon = cellToBoundary(h3IndexMax, true);
        h3IndexMaxRef.current = h3IndexMax;
        map.data.addGeoJson(cellPolygonFeature(h3IndexMax, polygon, {
            isLocation: true,
            resolution: h3ResolutionMax,
        }));
    }, [
        locationCell,
        h3IndexMax,
        h3Resolution,
    ]);

    const h3IndexRef = React.useRef<H3Index>(h3Index);

    // Set location cell feature
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!map) return;

        map.data.getFeatureById(h3Index)?.setProperty(Property.IsLocation, true);
        map.data.getFeatureById(h3IndexRef.current)?.removeProperty(Property.IsLocation);
        h3IndexRef.current = h3Index;
    }, [
        h3Index,
    ]);

    // Remove cell features
    React.useEffect(() => {
        const { current: map } = mapRef;
        map?.data.forEach(feature => {
            const {
                resolution,
                isAsset,
                isAggregate,
                isLocation
            } = cellProperties(feature);

            if (grid) {
                if (!isAggregate && (isAsset || isLocation)) return;
                if (resolution === h3Resolution) return;
            }

            map.data.remove(feature);
        });
    }, [
        grid,
        h3Resolution,
    ])

    // Add cell features
    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!grid) return;

        map?.data.addGeoJson({
            type: 'FeatureCollection',
            features: gridDisk(h3Index, h3RingSize).reduce((
                features: Feature[],
                h3RingIndex,
            ) => {
                const feature = map.data.getFeatureById(h3RingIndex);
                if (feature) return features;

                features.push(cellPolygonFeature(h3RingIndex, cellToBoundary(h3RingIndex, true), {
                    resolution: h3Resolution,
                    isLocation: h3Index === h3RingIndex
                }));

                features.push(cellLabelFeature(cellToLatLng(h3RingIndex), {
                    index: h3RingIndex,
                    resolution: h3Resolution,
                    label: ' ',
                }));

                return features;
            }, [])
        });
    }, [
        grid,
        h3Index,
        h3Resolution,
    ]);

    // Set aggregate cell features
    React.useEffect(() => {
        if (!aggregate || !grid || !scope) return;
        mapRef.current?.data.forEach(feature => {
            const index = feature.getId() || feature.getProperty(Property.Index);
            const { label, resolution } = cellLabelProperties(feature);
            const count = vehiclesAggregate.cells[index];
            const max = vehiclesAggregate.max;

            if (count === undefined) return;

            if (label !== undefined) {
                if (resolution > h3ResolutionLocation) return;
                if (label !== count && count > 0) setCellLabelProperty(feature, Property.Label, count);
            } else {
                const { assetsCount, assetsMax } = cellProperties(feature);
                if (assetsCount !== count) setCellProperty(feature, Property.AssetsCount, count);
                if (assetsMax !== max) setCellProperty(feature, Property.AssetsMax, max);
            }
        });
    }, [
        aggregate,
        grid,
        scope,
        vehiclesAggregate,
    ]);

    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!googleMaps || !map || !scope) return;

        // console.log('markers', markers.current);

        const { LatLng, LatLngBounds, Marker, Animation, Point, Size } = googleMaps;
        // const { center, padding } = view || {};

        // const bounds = new LatLngBounds();

        const stations: string[] = [];

        const features: Feature[] = [];

        for (const vehicleId in vehicles) {
            const { location, station, h3Index } = vehicles[vehicleId];
            const stationId = station.id;
            const position = new LatLng(location.latitude, location.longitude);
            const marker = assetMarkersRef.current[stationId];

            stations.push(stationId);

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
                icon: pinSymbol(true)
            });

            if (onFocus) {
                newmarker.addListener('click', () => onFocus(stationId));
            }

            assetMarkersRef.current[stationId] = newmarker;

            // const polygon = cellToBoundary(h3Index, true);

            // features.push(cellPolygonFeature(h3Index, polygon, {
            //     resolution: h3ResolutionMax,
            //     isAsset: true,
            // }));
        }

        map.data.addGeoJson({
            type: 'FeatureCollection',
            features,
        });

        for (const stationId in assetMarkersRef.current) {
            const marker = assetMarkersRef.current[stationId];
            if (stations.indexOf(stationId) >= 0) {
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
            delete assetMarkersRef.current[stationId];
        }

        // if (!bounds.isEmpty()) {
        //     map.fitBounds(bounds, {
        //         left: 50, top: 50, right: 50,
        //         bottom: padding,
        //     });
        // }

    }, [
        googleMaps,
        scope,
        vehicles,
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
                ref={mapElementRef}
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
