import React from 'react';
import { useGoogleMapContext as useGoogleMapsContext } from '../../contexts/GoogleMap';
import { Coordinates, useLocationContext } from '../../contexts/Location';
import { useAssetContext } from '../../contexts/Asset';
import { cellToBoundary, cellToLatLng, getResolution, greatCircleDistance, gridDisk, H3Index, UNITS } from 'h3-js';
import { Feature } from 'geojson';
import './Map.css';
import { defaultCoordinates, h3ResolutionLocation, h3RingSize, locationDebounce } from '../../config';
import { CreateAnimation, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { useThemeContext } from '../../contexts/Theme';
import { styleCell, styleCellLabel, styleMap, styleMarker } from './style';
import { initializeRef } from '../../utils/hooks/intializeRef';
import { useStationContext } from '../../contexts/Station';
import { Token } from '../../theme/theme';
import { point, polygon, getProperty, Property, prefixStationMarker, prefixCellLabel, Type, CellPolygon } from '../../utils/mapData';

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

// const addCells = (
//     grid: boolean,
//     map: google.maps.Map | undefined,
//     h3Index?: H3Index,
//     h3Resolution?: number,
// ) => {
//     if (!grid || !map || !h3Index || !h3Resolution) return;

//     const features: Feature[] = [];
//     console.log('addCells', h3Index, h3Resolution)
//     gridDisk(h3Index, h3RingSize).forEach((
//         h3RingIndex, 
//     ) => {
//         const feature = map.data.getFeatureById(h3RingIndex);
//         // console.log('exist?', h3RingIndex, !!feature, h3Index === h3RingIndex);
//         if (feature) return;
//         // console.log('addCell', index, h3RingIndex);
//         const isLocation = h3Index === h3RingIndex;
//         features.push(cellPolygon(h3RingIndex, cellToBoundary(h3RingIndex, true), {
//             [Property.Index]: h3RingIndex,
//             // [Property.Resolution]: h3Resolution,
//             [Property.IsLocation]: isLocation,
//         }));

//         // features.push(label(cellToLatLng(h3RingIndex), {
//         //     [Property.Index]: h3RingIndex,
//         //     [Property.Resolution]: h3Resolution,
//         //     [Property.Label]: ' ',
//         // }));
//     });
    
//     map.data.addGeoJson({
//         type: 'FeatureCollection',
//         features,
//     });
// }

const addFeatures = (
    map: google.maps.Map,
    features: Feature[],
) => {
    // return;
    map.data.addGeoJson({
        type: 'FeatureCollection',
        features,
    });
}

// const addMarkers = (
//     scope: boolean,
//     map?: google.maps.Map,
//     assetsByStation?: AssetsByStation,
//     stations?: Stations,
// ) => {
//     if (!scope || !map || !assetsByStation || !stations) return;
//     const features: Feature[] = [];

//     for (const id in assetsByStation) {
//         const station = stations[id];
//         if (!station) continue;

//         const feature = map.data.getFeatureById(setStationId(id));
//         if (feature) continue;

//         const { h3Index, location: { latitude, longitude } } = station;
//         const count = assetsByStation[id];
//         const resolution = getResolution(h3Index);

//         // if (onFocus) {
//         //     newmarker.addListener('click', () => onFocus(stationId));
//         // }

//         // console.log('station', { count })
//         features.push(point(setStationId(id), [latitude, longitude], {
//             // [Property.Resolution]: resolution,
//             [Property.Label]: count,
//             [Property.Index]: id,
//             [Property.IsStation]: true,
//         }))
//     }

//     addFeatures(map, features);
// }

// const aggregateCells = (
//     aggregate?: boolean,
//     map?: google.maps.Map,
//     assetsByLocation?: H3Aggregates,
// ) => {
//     if (!aggregate || !map || !assetsByLocation) return;

//     const features: Feature[] = [];
//     console.log('aggregateCells', assetsByLocation)
//     for (const h3Index in assetsByLocation.cells) {
//         const count = assetsByLocation.cells[h3Index];

//         const cell = map.data.getFeatureById(h3Index);
//         if (!cell) continue;
        
//         setProperty(cell, Property.AssetsCount, count);
//         setProperty(cell, Property.AssetsMax, assetsByLocation.max);

//         const resolution = getProperty(cell, Property.Resolution);
//         if (resolution > h3ResolutionLocation) continue;

//         const cellLabel = map.data.getFeatureById(labelId(h3Index));
//         const label = count > 0 ? count : ' ';

//         if (cellLabel) {
//             setProperty(cellLabel, Property.Label, label);
//         } else {
//             features.push(point(labelId(h3Index), cellToLatLng(h3Index), {
//                 [Property.Resolution]: resolution,
//                 [Property.Label]: label,
//                 [Property.Index]: h3Index,
//             }));
//         }
//     }

//     map.data.addGeoJson({
//         type: 'FeatureCollection',
//         features,
//     });
// }

const Map = React.memo<Props>(({
    aggregate,
    center: coordinates = defaultCoordinates,
    draggable = true,
    locationCell,
    centerLocation = true,
    centerMarker,
    positionMarker,
    grid = true,
    height = '100%',
    scope = true,
    view,
    zoom = 6,
    onClick,
    onFocus,
    onDrag,
}) => {
    const { location, position, setLocation, setScope } = useLocationContext();
    const { assetsByLocation, assetsByStation } = useAssetContext();
    const { stations } = useStationContext();
    const { color } = useThemeContext();
    const googleMaps = useGoogleMapsContext();

    const styles = React.useMemo(() => styleMap(color), [color]);

    // const { coordinates, diameter, h3IndexMax, h3Index, h3Resolution } = location;

    // React.useEffect(() => {
    //     if (live) setCenter(location.coordinates);
    // }, [live, location.coordinates]);

    // window.fetch('https://ipapi.co/json/', { cache: 'force-cache' }).then(response => {
    //     response.json().then(({ latitude, longitude }: IPRegion) => {
    //         if (!latitude || !longitude || location !== defaultRegion) return;
    //         map.setCenter(new LatLng(latitude, longitude));
    //     });
    // });

    const mapElementRef = React.useRef<HTMLDivElement>();

    const mapRef = React.useRef<google.maps.Map>();
    const centerMarkerRef = React.useRef<google.maps.Marker>();
    const positionMarkerRef = React.useRef<google.maps.Marker>();

    // const locationCircleRef = React.useRef<google.maps.Circle>();
    // const boundsCircleRef = React.useRef<google.maps.Circle>();

    // const [isZooming, setZooming] = React.useState(false);

    console.log('renderMap');

    const locationInitRef = React.useRef<boolean>();

    const updateLocation = React.useCallback(() => {
        const bounds = mapRef.current?.getBounds();
        const center = bounds?.getCenter().toJSON();
        if (!bounds || !center) return;

        console.log('updateLocation', { bounds, center });
        locationInitRef.current = true;
        centerMarkerRef.current?.setPosition(center)

        const northEast = bounds?.getNorthEast().toJSON();
        // const southWest = bounds?.getSouthWest().toJSON();
        const distance = 2 * greatCircleDistance(
            [northEast.lat, northEast.lng],
            [center.lat, center.lng],
            UNITS.km
        );

        // const locationRatio = 1 // zoom ? diameter / distance : 1;
        // console.log({ diameter, distance, locationRatio })
        // const { current: boundsCircle } = boundsCircleRef;
        // boundsCircle?.setRadius(distance / 2 * 1000);
        // boundsCircle?.setCenter(coordinates);

        // locationCircleRef.current?.setCenter(coordinates);
        // locationCircleRef.current?.setRadius(distance / 2 * 1000 * locationRatio)
        // console.log('bounds changed', { center, distance }, locationRatio)
        setLocation({
            coordinates: center,
            diameter: distance,
        });
        // setScope(scope);

    }, [
        // location?.diameter,
        // zoom,
    ]);

    // const mapRef = React.useRef<google.maps.Map>();

    const createRef = React.useCallback(async (
        mapElement: HTMLDivElement | null,
    ) => {
        if (!mapElement || mapElementRef.current === mapElement) return;

        const { LatLng, Marker } = await googleMaps;

        // if (mapRef.current) {
        //     const { current: map } = mapRef;
        //     // mapRef.current?.setCenter(center);
        // }


        const center = new LatLng(coordinates || defaultCoordinates);
        console.log('createRef', mapElement);  

        const map = new google.maps.Map(mapElement, {
            // mapId: process.env.REACT_APP_GOOGLE_API_KEY,
            center, 
            draggable,
            zoom,
            maxZoom,
            minZoom,
            disableDefaultUI: true,
            styles,
            keyboardShortcuts: false,
            backgroundColor: color[Token.MonoLow1],
        });

        // updateLocation(map);
        // console.log('getBounds', map.getBounds());

        locationInitRef.current = false;
        mapElementRef.current = mapElement; 
        mapRef.current = map;

        // if (!center) {
        //     const circle = new Circle({
        //         center: coordinates,
        //         radius: diameter / 2 * 1000,
        //         // map,
        //     });
        //     locationCircleRef.current = circle;
        //     const bounds = new LatLngBounds(circle.getBounds());

        //     console.log('fitBounds', bounds)
        //     map.getProjection()
        //     !zoom
        //         ? map.fitBounds(bounds, 0) // how much greater than location area?
        //         : map.moveCamera({
        //             center: bounds.getCenter(),
        //             zoom,
        //         });
        // }

        // addCells(grid, map, h3Index, h3Resolution);
        // aggregateCells(aggregate && grid && scope, map, assetsByLocation)
        // addMarkers(scope, map, assetsByStation, stations);

        // const { current: centerMarker } = centerMarkerRef;

        // positionMarkerRef.current?.setMap(map);
        // centerMarkerRef.current?.setMap(map);

        centerMarker && initializeRef(centerMarkerRef, new Marker({
            position: center,
            ...styleMarker(' ', color),
            map, 
        }));

        onFocus && map.data.addListener('click', ({ feature }: google.maps.Data.MouseEvent) => {
            console.log('click');
            if (feature.getProperty(Property.Type) !== Type.StationMarker) return;
            onFocus(feature.getProperty(Property.Index));
        });

        map.data.setStyle(feature => {
            const type: Type = feature.getProperty(Property.Type);
            const label = feature.getProperty(Property.Label);

            switch (type) {
                case Type.StationMarker: return styleMarker(label, color);
                case Type.CellLabel: return styleCellLabel(label, color);
                case Type.CellPolygon: return styleCell(feature, color);
            }
        });

        let locationTimeout: number;

        centerLocation && map.addListener('bounds_changed', () => {
            window.clearTimeout(locationTimeout);
            locationTimeout = window.setTimeout(
                updateLocation,
                locationInitRef.current ? locationDebounce : 0,
            );
        });

        map.addListener('click', () => onClick?.());
        map.addListener('dragend', () => onDrag?.());
    }, [
        // aggregate,
        // assetsByLocation,
        // assetsByStation,
        coordinates,
        // location?.coordinates,
        // diameter,
        color,
        googleMaps,
        // grid,
        // scope,
        onClick,
        onDrag, 
        onFocus,
        zoom,
    ]);

    const zoomRef = React.useRef<number>();
 
    // Set map zoom
    React.useEffect(() => {
        if (!zoom || zoomRef.current === zoom) return;
        mapRef.current?.setZoom(zoom);
        zoomRef.current = zoom;
    }, [
        zoom,
    ]);

    const coordinatesRef = React.useRef<Coordinates>();

    // Set map center
    React.useEffect(() => {
        if (!coordinates) return;
        const { lat, lng } = coordinates;
        const { current: { lat: latBefore, lng: lngBefore } = {} } = coordinatesRef;
        if (lat === latBefore && lng === lngBefore) return;
        console.log('center', lat, lng) 
        mapRef.current?.setCenter({ lat, lng });
        coordinatesRef.current = coordinates; 
    }, [
        coordinates,
    ]);

    // const h3IndexMaxRef = React.useRef<H3Index>();

    // Set max resolution location cell
    // React.useEffect(() => {
    //     const { current: map } = mapRef;
    //     if (!map) return;

    //     const feature = h3IndexMaxRef.current && map.data.getFeatureById(h3IndexMaxRef.current);
    //     if (feature) map.data.remove(feature);

    //     const h3IndexMax = location?.h3IndexMax;
    //     if (!locationCell || !h3IndexMax || location.h3Resolution <= h3ResolutionLocation) return;
    
    //     const polygon = cellToBoundary(location.h3IndexMax, true);
    //     h3IndexMaxRef.current = h3IndexMax;
    //     map.data.addGeoJson(cellPolygon(h3IndexMax, polygon, {
    //         [Property.Index]: h3IndexMax,
    //         [Property.IsLocation]: true,
    //         [Property.Resolution]: h3ResolutionMax,
    //     }));
    // }, [
    //     locationCell,
    //     location?.h3IndexMax,
    //     location?.h3Resolution,
    // ]);

    const h3IndexRef = React.useRef<H3Index>();

    // // Set current resolution location cell
    // React.useEffect(() => {
    //     const { current: map } = mapRef;
    //     const h3Index = location?.h3Index;
    //     if (!map || !h3Index) return;

    //     map.data.getFeatureById(h3Index)?.setProperty(Property.IsLocation, true);
    //     if (h3IndexRef.current) map.data.getFeatureById(h3IndexRef.current)?.removeProperty(Property.IsLocation);
    //     h3IndexRef.current = h3Index;
    // }, [
    //     location?.h3Index,
    // ]);

    // Remove cells
    // React.useEffect(() => {
    //     const { current: map } = mapRef;
    //     const h3Resolution = location?.h3Resolution;
    //     if (!h3Resolution) return;

    //     map?.data.forEach(feature => {
    //         const isAsset = getProperty(feature, Property.IsAsset);
    //         const isLocation = getProperty(feature, Property.IsLocation);
    //         const resolution = getProperty(feature, Property.Resolution);
    //         const isAggregate = resolution <= h3ResolutionLocation;

    //         if (grid) {
    //             if (!isAggregate && (isAsset || isLocation)) return;
    //             if (resolution === h3Resolution) return;
    //         }
    //         // console.log('removeCell', feature.getId());
    //         map.data.remove(feature);
    //     });
    // }, [
    //     grid,
    //     location?.h3Resolution,
    // ]);

    const h3ResolutionRef = React.useRef<number>();

    React.useEffect(() => {
        if (grid && location?.h3Resolution === h3ResolutionRef.current) return;
        const { current: map } = mapRef;
        map?.data.forEach(feature => {
            // const isAsset = getProperty(feature, Property.IsAsset);
            // const isLocation = getProperty(feature, Property.IsLocation);
            // const resolution = getProperty(feature, Property.Resolution);
            // const isAggregate = resolution <= h3ResolutionLocation;
 
            // console.log('removeFeature', feature.getId());
            map.data.remove(feature);
        });
    }, [
        location?.h3Resolution,
        grid,
    ]);

    // Add cells
    React.useEffect(() => {
        const { current: map } = mapRef;
        const h3Index = location?.h3Index;
        // const h3Resolution = location?.h3Resolution;
        console.log('addCells', map, h3Index)
        if (!map || !h3Index) return;

        // map.data.forEach(feature => {
        //     // const isAsset = getProperty(feature, Property.IsAsset);
        //     // const isLocation = getProperty(feature, Property.IsLocation);
        //     const resolution = getProperty(feature, Property.Resolution);
        //     // const isAggregate = resolution <= h3ResolutionLocation;

        //     if (grid && resolution === h3Resolution) return;
 
        //     console.log('removeCell', feature.getId());
        //     map.data.remove(feature);
        // });

        if (!grid) return;

        const features: Feature[] = [];
        console.log('gridDisk');
        gridDisk(h3Index, h3RingSize).forEach((
            h3RingIndex, 
        ) => {
            const feature = map.data.getFeatureById(h3RingIndex);
            // console.log('exist?', h3RingIndex, !!feature, h3Index === h3RingIndex);
            if (feature) return;
            // console.log('addCell', index, h3RingIndex);
            const isLocation = h3Index === h3RingIndex;
            features.push(polygon<CellPolygon>(h3RingIndex, cellToBoundary(h3RingIndex, true), {
                [Property.Index]: h3RingIndex,
                [Property.Type]: Type.CellPolygon,
                // [Property.Resolution]: h3Resolution,
                [Property.IsLocation]: isLocation,
            }));
    
            // features.push(label(cellToLatLng(h3RingIndex), {
            //     [Property.Index]: h3RingIndex,
            //     [Property.Resolution]: h3Resolution,
            //     [Property.Label]: ' ',
            // }));
        });
        
        addFeatures(map, features);
        // addCells(
        //     grid,
        //     mapRef.current,
        //     location?.h3Index,
        //     location?.h3Resolution,
        // );
    }, [
        grid,
        location?.h3Index,
        location?.h3Resolution,
        // mapRef.current
    ]);

    // Set aggregate cell properties
    React.useEffect(() => {
        // console.log('aggregate effect')
        // aggregateCells(
        //     aggregate && grid && scope,
        //     mapRef.current,
        //     assetsByLocation,
        // )

        const { current: map } = mapRef;
        if (!aggregate || !grid || !scope || !map || !assetsByLocation) return;

        const features: Feature[] = [];
        console.log('aggregateCells', assetsByLocation)
        for (const h3Index in assetsByLocation.cells) {
            const count = assetsByLocation.cells[h3Index];

            const cell = map.data.getFeatureById(h3Index);
            if (!cell) continue;
            
            cell.setProperty(Property.AssetsCount, count);
            cell.setProperty(Property.AssetsMax, assetsByLocation.max);
            
            // setProperty(cell, Property.AssetsCount, count);
            // setProperty(cell, Property.AssetsMax, assetsByLocation.max);

            const resolution = getProperty(cell, Property.Resolution);
            if (resolution > h3ResolutionLocation) continue;

            const cellLabel = map.data.getFeatureById(prefixCellLabel(h3Index));
            const label = count > 0 ? count : ' ';

            if (cellLabel) {
                cellLabel.setProperty(Property.Label, label);
                // setProperty(cellLabel, Property.Label, label);
            } else {
                features.push(point(prefixCellLabel(h3Index), cellToLatLng(h3Index), {
                    // [Property.Resolution]: resolution,
                    [Property.Label]: label,
                    type: Type.CellLabel,
                    // [Property.Index]: h3Index,
                }));
            }
        }

        addFeatures(map, features);

        // map.data.addGeoJson({
        //     type: 'FeatureCollection',
        //     features,
        // });
        // const { current: map } = mapRef;
        // if (!map || !aggregate || !grid || !scope) return;

        // const features: Feature[] = [];
        // console.log('aggregate', assetsByLocation)
        // for (const h3Index in assetsByLocation.cells) {
        //     const count = assetsByLocation.cells[h3Index];
        //     if (!count) continue;

        //     const polygon = map.data.getFeatureById(h3Index);

        //     if (!polygon) continue;

        //     console.log(h3Index, { count }, assetsByLocation.max)
        //     setProperty(polygon, Property.AssetsCount, count);
        //     setProperty(polygon, Property.AssetsMax, assetsByLocation.max);

        //     const resolution = getProperty(polygon, Property.Resolution);
        //     if (resolution > h3ResolutionLocation) return;

        //     const label = map.data.getFeatureById(labelId(h3Index));

        //     if (label) {
        //         setProperty(label, Property.Label, count);
        //     } else {
        //         features.push(point(labelId(h3Index), cellToLatLng(h3Index), {
        //             [Property.Resolution]: resolution,
        //             [Property.Label]: count,
        //             // [Property.Index]: id,
        //         }));
        //     }
        // }

        // map.data.addGeoJson({
        //     type: 'FeatureCollection',
        //     features,
        // });

        // map.data.forEach(feature => {
        //     const index = getProperty(feature, Property.Index);
        //     const label = getProperty(feature, Property.Label);
        //     const resolution = getProperty(feature, Property.Resolution);
        //     const count = assetsByLocation.cells[index];
        //     const max = assetsByLocation.max;

        //     if (count === undefined) return;

        //     if (label !== undefined) {
        //         if (resolution > h3ResolutionLocation) return;
        //         if (label !== count && count > 0) setProperty(feature, Property.Label, count);
        //     } else {
        //         const assetsCount = getProperty(feature, Property.AssetsCount);
        //         const assetsMax = getProperty(feature, Property.AssetsMax);
        //         if (assetsCount !== count) setProperty(feature, Property.AssetsCount, count);
        //         if (assetsMax !== max) setProperty(feature, Property.AssetsMax, max);
        //     }
        // });
    }, [
        aggregate,
        grid,
        // mapRef.current,
        scope,
        assetsByLocation,
    ]);

    React.useEffect(() => {
        const { current: map } = mapRef;
        if (!scope || !map || !assetsByStation || !stations) return;

        const features: Feature[] = [];
    
        for (const id in assetsByStation) {
            const station = stations[id];
            if (!station) continue;
    
            const feature = map.data.getFeatureById(prefixStationMarker(id));
            if (feature) continue;
    
            const { h3Index, location: { latitude, longitude } } = station;
            const count = assetsByStation[id];
            // const resolution = getResolution(h3Index);
    
            // if (onFocus) {
            //     newmarker.addListener('click', () => onFocus(stationId));
            // }
    
            // console.log('station', { count })
            features.push(point(prefixStationMarker(id), [latitude, longitude], {
                // [Property.Resolution]: resolution,
                [Property.Label]: count,
                [Property.Type]: Type.StationMarker,
                [Property.Index]: id,
                // [Property.IsStation]: true,
            }))
        }
    
        addFeatures(map, features);
        // addMarkers(
        //     scope,
        //     mapRef.current,
        //     assetsByStation,
        //     stations
        // );
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
