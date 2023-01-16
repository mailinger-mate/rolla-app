import React from 'react';
import { h3SetToFeatureCollection, h3ToFeature } from 'geojson2h3';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { Coordinates, useLocationContext } from '../../contexts/Location';
import { useVehicleContext } from '../../contexts/Vehicle';
import { Vehicle } from '../../utils/db/vehicle';
import { high1, high5, low, styleMap, warning } from '../../utils/geo/style';
import { cellToBoundary, cellToLatLng, greatCircleDistance, gridDisk, UNITS } from 'h3-js';
import { Feature } from 'geojson';
import { prefersColorDarkMedia } from '../../utils/prefersColor';
import './Map.css';
import { h3RingSize, locationDebounce } from '../../config';
import { CreateAnimation, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';


export interface View {
    center?: string[] | boolean;
    padding?: number;
}

const assetCellId = 'assetCell';

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
    assetCell?: boolean;
    center?: Coordinates;
    grid?: boolean;
    height?: string;
    live?: boolean;
    centerMarker?: MarkerColor;
    view?: View;
    zoom?: typeof zoomRange[number];
    // onBlur?: () => void;
    onClick?: () => void;
    onFocus?: (id: string) => void;
    // hideStation: () => void;
    onDrag?: () => void;
}

const animationFramerate = 1 / 20;
const cellCenterId = 'Center';
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

const randomColor = () => {
    const goldenAngle = 180 * (3 - Math.sqrt(5));
    return `hsl(${Math.random() * 10 * goldenAngle + 60}, 100%, ${Math.round(Math.random() * 100)}%)`;
};

const cellColor = (
    count?: number,
    max?: number
) => {
    if (!count || !max) return;
    return `hsl(120deg, ${Math.max(Math.round(count / max * 100), 10)}%, 50%)`;
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
    assetCell,
    grid = true,
    height = '100%',
    centerMarker,
    live = true,
    view,
    zoom,
    onClick,
    onFocus,
    onDrag,
    ...props
}) => {
    const { location, position, setLocation } = useLocationContext();
    // const { stations } = useStationContext();
    const { vehicles, vehiclesAggregate } = useVehicleContext();
    const googleMaps = useGoogleMapContext();

    const [map, setMap] = React.useState<google.maps.Map>();
    const mapRef = React.useRef<HTMLDivElement>(null);

    const centerMarkerRef = React.useRef<google.maps.Marker>();
    const positionMarker = React.useRef<google.maps.Marker>();

    const [prefersColorDark, setPrefersColorDark] = React.useState(prefersColorDarkMedia.matches);

    const [center, setCenter] = React.useState(props.center);

    const { coordinates, h3AssetIndex } = location;


    // React.useEffect(() => {
    //     if (live) setCenter(location.coordinates);
    // }, [live, location.coordinates]);

    // const { h3Index, h3Resolution } = location;

    // window.fetch('https://ipapi.co/json/', { cache: 'force-cache' }).then(response => {
    //     response.json().then(({ latitude, longitude }: IPRegion) => {
    //         if (!latitude || !longitude || location !== defaultRegion) return;
    //         map.setCenter(new LatLng(latitude, longitude));
    //     });
    // });

    React.useEffect(() => {
        const listener = (event: MediaQueryListEvent) => setPrefersColorDark(event.matches);
        prefersColorDarkMedia.addEventListener('change', listener);
        return () => prefersColorDarkMedia.removeEventListener('change', listener);
    });

    // const countMax = React.useRef<number>(0);
    // const resolution = React.useRef<number>(0);
    // const cells = React.useRef<string[]>([]);

    React.useEffect(() => {
        if (!googleMaps || !position) return;
        positionMarker.current?.setPosition(new googleMaps.LatLng(...position));
    }, [googleMaps, position]);

    const [isZooming, setZooming] = React.useState(false);
    console.log('renderMap')
    React.useEffect(() => {
        if (!googleMaps || !mapRef.current) return;
        const { Circle, Map, Marker, LatLng, LatLngBounds, Animation } = googleMaps;
        console.log('map', zoom, mapRef.current);
        const map = new google.maps.Map(mapRef.current, {
            center: center && new LatLng(...center),
            draggable: live,
            zoom,
            maxZoom: zoomRange[zoomRange.length - 1],
            // zoom: 6,
            minZoom: zoomRange[0],
            disableDefaultUI: true,
            styles: styleMap(prefersColorDark),
            keyboardShortcuts: false,
            backgroundColor: high5(prefersColorDark)
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
            console.log('setStyle');
            const label = feature.getProperty('label');

            if (label || label === 0) {
                // return {};
                return {
                    icon: noSymbol,
                    label: {
                        text: '' + label,
                        color: low(prefersColorDark),
                        className: 'cellLabel',
                        fontSize: '2.5vmin',
                    },
                    opacity: label > 0 ? 1 : 0,
                    zIndex: 5,
                };
            }
            const count = feature.getProperty('count');
            const max = feature.getProperty('max');
            const isAssetCell = feature.getId() === assetCellId;
            // const color = feature.getProperty('color');
            // if (color) return {
            //     fillColor: color === 'inside'
            //         ? 'lightgreen'
            //         : color === 'outside'
            //             ? 'tomato'
            //             : color,
            //     fillOpacity: 0.2,
            //     strokeWeight: 2,
            //     strokeColor: 'lightgrey',
            return {
                strokeColor: (isAssetCell ? warning() : high1(prefersColorDark)) + 'aa',
                strokeWeight: 1.5,
                strokeOpacity: 1,
                fillOpacity: count ? 0.2 : 0,
                fillColor: cellColor(count, max),
                zIndex: isAssetCell ? 2 : 1,
            };
        });

        map.addListener('click', () => {
            onClick && onClick();
        });

        let locationTimeout: number | null;

        // map.addListener('bounds_changed', () => {
        //     if (!locationTimeout) return;
        //     window.clearTimeout(locationTimeout);
        //     locationTimeout = null;
        // });

        map.addListener('bounds_changed', () => {
            if (locationTimeout) window.clearTimeout(locationTimeout);
            locationTimeout = window.setTimeout(() => {
                locationTimeout = null;
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
                setLocation({
                    coordinates,
                    diameter
                });
            }, locationDebounce);
        });

        map.addListener('dragend', () => {
            onDrag && onDrag();
        });

        // map.data.addListener('setproperty', (event: google.maps.Data.SetPropertyEvent) => {
        //     event.feature.
        // });

        // map.addListener('center_changed', () => {
        //     console.log('center cahnged');
        //     onBlur && onBlur();
        // })

        // map.addListener('bounds_changed', () => {
        //     const bounds = map.getBounds();
        //     if (!bounds) return bounds;
        //     const northEast = bounds?.getNorthEast();
        //     const southWest = bounds?.getSouthWest();
        //     setLocationBounds([
        //         [northEast.lat(), northEast.lng()],
        //         [southWest.lat(), southWest.lng()]
        //     ])
        // });

        setMap(map);

        positionMarker.current = new Marker({
            map,
            // position: new LatLng(latitude, longitude),
            // label: count ? count.toString() : '?',
            animation: Animation.DROP,
            icon: positionSymbol
        });

        // return map;

        // new Marker().setValues()
    }, [googleMaps, mapRef, prefersColorDark]);

    // React.useEffect(() => {
    //     if (!center || !googleMaps || !map) return;
    //     const [lat, lng] = center;
    //     console.log('setCenter')
    //     // map.setCenter({ lat, lng });
    // }, [center, googleMaps, map]);

    React.useEffect(() => {
        if (!map || !center || !live) return;
        // const center = map.getCenter();
        const [latCenter, lngCenter] = center;
        const [lat, lng] = coordinates;
        if (lat === latCenter && lng == lngCenter) return;
        console.log('setCenter', lat, latCenter, lng, lngCenter);
        setCenter([lat, lng]);
        map.setCenter({ lat, lng });
    }, [center, coordinates, live, map]);

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



    React.useEffect(() => {
        if (!map) return;
        const feature = map.data.getFeatureById(assetCellId);
        if (feature) map.data.remove(feature);
        if (!assetCell) return;
        const polygon = cellToBoundary(h3AssetIndex, true);
        const assetFeature: Feature = {
            type: 'Feature',
            id: assetCellId,
            geometry: {
                type: 'Polygon',
                coordinates: [polygon],
            },
            properties: {}
        };
        // console.log('assetFeature', assetFeature);
        map.data.addGeoJson(assetFeature);
    }, [
        assetCell,
        h3AssetIndex,
        map,
    ]);

    React.useEffect(() => {
        if (!center || !googleMaps || !map) return;
        if (!centerMarker) {
            centerMarkerRef.current?.setMap(null);
            centerMarkerRef.current = undefined;
            return;
        }
        const { LatLng, Marker } = googleMaps;
        if (!centerMarkerRef.current) {
            centerMarkerRef.current = new Marker({
                map,
                position: new LatLng(...center),
                // label: count ? count.toString() : '?',
                // animation: Animation.DROP,
                icon: pinSymbol(centerMarker)
            });
            return;
        }
        centerMarkerRef.current.setPosition(new LatLng(...location.coordinates));
    }, [
        center,
        centerMarker,
        googleMaps,
        map,
    ]);

    // const geohashPolygon = React.useCallback((geohash: string) => {
    //     if (!googleMaps) return;
    //     const { Polygon } = googleMaps;
    //     const polygon = geohashToPolygonGeometry(geohash);
    //     polygon
    //     new Polygon({
    //         path,
    //         strokeColor: "#FF0000",
    //         strokeOpacity: 0.8,
    //         strokeWeight: 2,
    //         // fillColor: "#FF0000",
    //         // fillOpacity: 0.35,
    //         map,
    //     });
    // }, [googleMaps]);

    // const geohashes = React.useRef<Geohash[]>([]);
    // const locationFeatures = React.useRef<FeatureCollection>();

    // const geohashMarkers = React.useRef<Record<string, google.maps.Marker>>({});
    // const geohashPolygons = React.useRef<Record<string, google.maps.Polygon>>({});

    // const [bounds, setBounds] = React.useState<GeohashRange[]>();

    // React.useEffect(() => {
    //     if (!googleMaps || !map || !bounds) return;
    //     // const path = geohashBounds.slice(1).map(([lat, lng]) => ({ lat, lng }));
    //     // locationQueryBounds?.forEach(([start, end]) => {
    //     //     map.data.addGeoJson(geohashToPolygonFeature(start));
    //     //     // map.data.addGeoJson(geohashToPolygonFeature(end));
    //     // }, []);

    //     // locationQueryBounds.forEach(([start, end]) => {
    //     //     const features = map.data.addGeoJson(geohashToPolygonFeature(start));
    //     //     locationFeatures.current = locationFeatures.current?.concat(features) || features;
    //     // });
    //     // console.log('locationQuery', JSON.stringify(locationQueryBounds));
    //     // const { LatLng, Marker, Polygon, SymbolPath } = googleMaps;

    //     // map.data.addGeoJson(locationFeatures.current);


    //     // if (!locationBoundsPolygon.current) {
    //     //     locationBoundsPolygon.current = new Polyline({
    //     //         path,
    //     //         strokeColor: "#FF0000",
    //     //         strokeOpacity: 0.8,
    //     //         strokeWeight: 2,
    //     //         // fillColor: "#FF0000",
    //     //         // fillOpacity: 0.35,
    //     //         map,
    //     //     });
    //     // } else {
    //     //     locationBoundsPolygon.current.setPath(path);
    //     // }

    // }, [googleMaps, map, bounds, location]);

    // React.useEffect(() => {
    //     if (!map || !vehiclesAggregate) return;
    //     console.log('vehilcesCount', vehiclesAggregate); 
    //     for (const geohashRange in vehiclesAggregate) {
    //         const count = vehiclesAggregate[geohashRange];
    //         if (!count) continue;
    //         const polygon = map.data.getFeatureById(geohashRange);
    //         const point = map.data.getFeatureById(geohashRange + centerId);
    //         if (cellMax.current < count) cellMax.current = count;
    //         console.log('setProperty', count, cellMax.current, polygon, point)
    //         polygon?.setProperty('count', count);
    //         polygon?.setProperty('max', cellMax.current);
    //         point?.setProperty('count', count);
    //     }
    // }, [map, vehiclesAggregate]);

    // const areaCircle = React.useRef<google.maps.Circle>();

    // React.useEffect(() => {
    //     if (!location || !googleMaps || !map) return;

    //     const { coordinates, radius } = location;
    //     const { Circle, LatLng } = googleMaps;
    //     const center = new LatLng(...coordinates);
    //     if (!areaCircle.current) {
    //         areaCircle.current = new Circle({
    //             map,
    //             center,
    //             radius: radius,
    //             strokeColor: 'tomato',
    //             strokeWeight: 1,
    //             fillOpacity: 0.1,
    //         })
    //     } else {
    //         areaCircle.current.setCenter(center);
    //         areaCircle.current.setRadius(radius);
    //     }
    // }, [location, googleMaps, map]);

    // React.useEffect(() => {
    //     if (!map || !cellIndex) return;
    //     // setCellMax(0);
    //     // for (const index in cellPolygons.current) {
    //     //     const marker = cellMarkers.current[index];
    //     //     const polygon = cellPolygons.current[index];
    //     //     polygon.setMap(null);
    //     //     marker.setMap(null);
    //     // }
    //     // cellPolygons.current = {};
    //     // cellMarkers.current = {};
    //     // cells.current = [];
    //     // map.data.remo

    //     const resolution = getResolution(cellIndex);

    // }, [map, cellIndex]);

    // const max = Math.random() * 50;

    // const cellsRef = React.useRef<string>();

    // const [resolution, setResolution] = React.useState<number>();

    // React.useEffect(() => {
    //     if 
    //     setResolution(cell?.h3Resolution);
    // }, [cell, resolution])

    React.useEffect(() => {
        if (!googleMaps || !map) return;
        // const { Data, LatLng, Marker } = googleMaps;
        // const { Polygon } = Data;

        console.log('draw cells', location);
        // if (cell?.h3Resolution !== resolution) {
        //     map.data.forEach(feature => map.data.remove(feature));
        //     if (!cell) return;
        //     countMax.current = 0;
        // }

        // setResolution(cell?.h3Resolution);
        map.data.forEach(feature => {
            const resolution = feature.getProperty('resolution');
            if (!resolution) return;
            if (grid && location.h3Resolution === resolution) return;
            console.log('removeCell');
            map.data.remove(feature);

            // map.data.remove(feature);
            // let opacity = 1;
            // // if (feature.getProperty('hidden')) return;
            // const interval = setInterval(() => {
            //     opacity -= 0.2;
            //     map.data.overrideStyle(feature, {
            //         strokeOpacity: opacity,
            //     });
            //     // console.log('opacity', opacity)
            //     if (opacity > 0) return;
            //     console.log('removeCell');
            //     clearInterval(interval);
            //     // feature.setProperty('hidden', true);
            //     map.data.remove(feature);
            // }, 1 / 60 / 2);
        });


        if (!grid) return;

        map.data.addGeoJson({
            type: 'FeatureCollection',
            features: gridDisk(location.h3Index, h3RingSize).reduce((
                features: Feature[],
                h3Index,
            ) => {
                // const count = vehiclesAggregate.cells[cellIndex] || 0;
                // console.log(cellIndex, count)
                // if (!count) return features;
                // if (count > countMax.current) countMax.current = count;

                const feature = map.data.getFeatureById(h3Index);
                if (feature) return features;
                // if (cellFeature) {
                //     const labelFeature = map.data.getFeatureById(cellIndex + cellCenterId);
                //     const featureCount: number = cellFeature.getProperty('count') || 0;
                //     const featureMax: number = cellFeature.getProperty('max') || 0;

                //     if (count !== featureCount) {
                //         cellFeature.setProperty('count', count);
                //         labelFeature?.setProperty('count', count);
                //     }

                //     if (count && featureMax < countMax.current) {
                //         cellFeature.setProperty('max', countMax.current);
                //     }

                //     return features;
                // }

                const polygon = cellToBoundary(h3Index, true);
                const [latitude, longitude] = cellToLatLng(h3Index);
                const resolution = location.h3Resolution;

                features.push({
                    type: 'Feature',
                    id: h3Index,
                    geometry: {
                        type: 'Polygon',
                        coordinates: [polygon],
                    },
                    properties: {
                        // count,
                        // max: vehiclesAggregate.max,
                        h3Index,
                        resolution,
                    }
                });

                features.push({
                    type: 'Feature',
                    // id: cellIndex + cellCenterId,
                    geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    properties: {
                        h3Index,
                        label: 0,
                        resolution,
                    },
                })
                return features;
            }, [])
        });

        // console.log('features', map.data

        // map.data.addGeoJson(
        //     wrapAsFeatureCollection(
        //         location.geohashesSorted.reduce((
        //             features: Feature[],
        //             [outside, inside],
        //         ) => {
        //             outside.forEach(geohash => features.push(geohashToPolygonFeature(geohash, { color: 'outside' })));
        //             inside.forEach(geohash => features.push(geohashToPolygonFeature(geohash, { color: 'inside' })));
        //             return features;
        //         }, [])
        //     )
        // );

        // if (cellsRef.current === cellIndex) return;

        // const startCell = cellToChildren(cellIndex, cellResolution + 1)
        // const children1 = cellToChildren('85658e97fffffff', 9)
        // const children2 = cellToChildren(children1[0], cellResolution + 2);
        // const children3 = cellToChildren(children2[1], cellResolution + 3);
        // console.log('start/end', location.h3Range);
        // console.log('cellsBetwen', cellsBetween(startCell, endCell, 4))

        // const color = randomColor();
        // // const cells = cellsBetween(startCell, endCell, 4);
        // map.data.addGeoJson(
        //     h3SetToFeatureCollection(
        //         cellsBetween(...location.h3Range, 4),
        //         () => ({ color })
        //     )
        // );


        // cellsRef.current = cellIndex;
        // map.data.addGeoJson(h3SetToFeatureCollection(grandChildren));
        // map.data.addGeoJson(h3SetToFeatureCollection([
        //     '8765812c7ffffff',
        //     '8765812c8ffffff',
        //     '8765812c9ffffff',
        // ]))
        // map.data.forEach(feature => {
        //     const cellResolution: number = feature.getProperty('resolution');

        //     if (cellResolution !== resolution) {
        //         console.log('res', resolution, cellResolution)
        //         map.data.remove(feature);
        //         return;
        //     }

        //     const count = feature.getProperty('count');
        // });

        // if (cellResolution.current !== resolution) {
        //     cellResolution.current = resolution;
        //     cells.current = [];
        // }
    }, [
        googleMaps,
        grid,
        location,
        map,
    ]);

    React.useEffect(() => {
        if (!map || !aggregate || !grid) return;
        map.data.forEach(feature => {
            const featureLabel = feature.getProperty('label');
            const h3Index = feature.getProperty('h3Index');
            const count = vehiclesAggregate.cells[h3Index] || 0;
            if (featureLabel || featureLabel === 0) {
                if (featureLabel === count) return;
                console.log('setLabel', count);
                feature.setProperty('label', count);
                // map.data.overrideStyle(feature, {
                //     opacity: count ? 1 : 0,
                // })

                return;
            }

            const featureCount = feature.getProperty('count');
            const featureMax = feature.getProperty('max');
            const max = vehiclesAggregate.max;
            if (featureCount !== count) feature.setProperty('count', count);
            if (featureMax !== max) feature.setProperty('max', max);

        });
    }, [
        aggregate,
        grid,
        map,
        vehiclesAggregate,
    ]);

    // React.useEffect(() => {
    //     if (!cellIndex) return;

    //     cellMarkers
    // }, [cellIndex]);

    // React.useEffect(() => {
    //     if (!googleMaps || !map || !location || !cell || !geohashRanges) return;
    // const resolution = getResolution(radius);
    // console.log('res', resolution)
    // const [latitude, longitude] = location;
    // const cell = latLngToCell(latitude, longitude, resolution);
    // const edge = edgeLength(cell, UNITS.m);
    // const [start] = geohashQueryBounds(location, edge)[0];
    // const geohashStart = geohashToPolygonGeometry(start);
    // const cellPoints = cellToBoundary(cell);

    // const { Circle, LatLng, Marker, Polygon, SymbolPath } = googleMaps;
    // const paths = geohashStart.coordinates.map(point => point.map(([longitude, latitude]) => new LatLng(latitude, longitude)));
    // const cellPaths = cellPoints.map(([latitude, longitude]) => new LatLng(latitude, longitude));
    // const paths = geohashCell.map(([latitude, longitude]) => new LatLng(latitude, longitude));
    // if (!areaCell.current) {
    //     areaCell.current = new Polygon({
    //         paths: cellPaths,
    //         strokeColor: 'grey',
    //         strokeWeight: 1,
    //         fillOpacity: 0,
    //         map,
    //     });
    // } else {
    //     areaCell.current.setPaths(cellPaths);
    // }


    // areaDisk.current?.forEach(polygon => {
    //     polygon.setMap(null);
    // });

    // for (let index = 0; index < areaDisk.current.length; index++) {
    //     const polygon = areaDisk.current[index];
    //     polygon.setMap(null);
    //     areaDisk.current.splice(index, 1);
    // }


    // const areaRadius = getHexagonEdgeLengthAvg(resolution, UNITS.m) * 0.9;
    // const [areaLatitude, areaLongitude] = cellToLatLng(cell);
    // const areaCenter = new LatLng(areaLatitude, areaLongitude);

    // geohashes.current = [];

    // const geohashRanges = geohashQueryBounds([areaLatitude, areaLongitude], areaRadius);

    // const features = geohashRanges.reduce((
    //     features: ReturnType<typeof geohashToPolygonFeature>[],
    //     [start, end]
    // ) => {
    //     const geohashRanges = geohashesBetween(start, end);
    //     // console.log('between', start, end, geohashRanges)
    //     geohashRanges.forEach(geohash => {
    //         if (geohashes.current.indexOf(geohash) >= 0) return;
    //         const isExcluded = geohashRangesExcluded && geohashRangesExcluded.flat().indexOf(geohash) >= 0;

    //         if (isExcluded) return;
    // try {
    //     const { lat, lon } = gg.decode(geohash);
    //     const distance = distanceBetween([areaLatitude, areaLongitude], [lat, lon]);
    //     console.log('distance', distance * 1000, areaRadius)
    //     if (distance * 1000 > areaRadius * 2) {
    //         return;
    //     }
    // } catch {
    //     return;
    // }

    // const geohashPolygon = geohashToPolygonFeature(geohash, { color });

    // const cells = polygonToCells(geohashPolygon.geometry.coordinates, 3, true);
    // cellsToMultiPolygon(cells);

    // const h3Polygons = cellsToMultiPolygon(cells);

    // h3Polygons.forEach(polygon => {
    //     if (geohashPolygons.current[geohash]) return;
    //     const paths = polygon.map(loop =>
    //         loop.map(([latitude, longitude]) => new LatLng(latitude, longitude)));

    //     geohashPolygons.current[geohash] = new Polygon({
    //         paths,
    //         map,
    //         strokeColor: '#fff',
    //         strokeOpacity: 1,
    //         strokeWeight: 2,
    //         fillColor: color,
    //         fillOpacity: 0.2,
    //     })
    // });

    // console.log('point', latitude, longitude)

    // if (!geohashMarkers.current[geohash]) {
    // const point = geohashToPointFeature(geohash);
    // const [longitude, latitude] = point.geometry.coordinates;
    // const position = new LatLng(latitude, longitude);
    // geohashMarkers.current[geohash] = new Marker({
    //     map,
    //     label: geohash,
    //     position,
    //     icon: {
    //         fillOpacity: 0,
    //         strokeOpacity: 0,
    //         path: SymbolPath.CIRCLE,
    //     }
    // });
    // }
    // feature.
    // geohashes.current.push(geohash);
    // features.push(geohashPolygon);
    // });
    // const geohashes = getGeohashesBetweenTwoGeohashes(start, end);
    // features.push(geohashToPolygonFeature(start, { fillOpacity: 0, fillColor: 'red' }))
    // features.push(geohashToPolygonFeature(end, { fillOpacity: 0 }))
    // console.log(geohashes);
    // geohashes.forEach(geohash =>
    //     features.push(geohashToPolygonFeature(geohash)));
    // locationFeatures.current = locationFeatures.current?.concat(features) || features;
    //     return features;
    // }, []);

    //     map.data.forEach((feature) => map.data.remove(feature));

    //     map.data.addGeoJson(wrapAsFeatureCollection(features));

    //     for (const geohash in geohashMarkers.current) {
    //         if (geohashes.current.indexOf(geohash) < 0) {
    //             geohashMarkers.current[geohash].setMap(null);
    //             delete geohashMarkers.current[geohash];
    //         }
    //     }

    //     for (const geohash in geohashPolygons.current) {
    //         if (geohashes.current.indexOf(geohash) < 0) {
    //             geohashPolygons.current[geohash].setMap(null);
    //             delete geohashPolygons.current[geohash];
    //         }
    //     }
    // }, [googleMaps, map, geohashRanges, geohashRangesExcluded])


    // React.useEffect(() => {
    //     if (!googleMaps || !map || !area || !radius) return;
    //     const { Circle } = googleMaps;
    //     const [lat, lng] = area;
    //     const center = { lat, lng };
    //     if (areaCircle.current) {
    //         areaCircle.current.setCenter(center);
    //         areaCircle.current.setRadius(radius);
    //         return;
    //     }

    //     areaCircle.current = new Circle({
    //         map,
    //         center,
    //         radius,
    //         strokeColor: 'tomato',
    //         fillOpacity: 0,
    //         strokeWeight: 1,
    //     })
    // }, [googleMaps, map, area, radius]);


    // const locationCircle = React.useRef<google.maps.Circle>();

    // React.useEffect(() => {
    //     if (!googleMaps || !map || !location || !locationRadius) return;
    //     const { Circle } = googleMaps;
    //     const [lat, lng] = location;
    //     const center = { lat, lng };
    //     if (locationCircle.current) {
    //         locationCircle.current.setCenter(center);
    //         locationCircle.current.setRadius(locationRadius);
    //         return;
    //     }

    //     // locationCircle.current = new Circle({
    //     //     map,
    //     //     center,
    //     //     radius: locationRadius,
    //     //     fillOpacity: 0,
    //     //     strokeColor: 'teal',
    //     //     strokeWeight: 1,
    //     // })
    // }, [googleMaps, map, location, locationRadius]);

    // React.useEffect(() => {
    //     if (!map) return;

    //     if (!vehicles) map.setZoom(4);
    // }, [vehicles, map]);

    // React.useEffect(() => {
    //     if (!googleMaps || !map) return;
    //     const center = map.getCenter();
    //     if (!center) return;

    //     const { LatLngBounds, geometry } = googleMaps;
    //     const bounds = new LatLngBounds();
    //     bounds.extend(geometry.spherical.computeOffset(center, radius, 90));
    //     bounds.extend(geometry.spherical.computeOffset(center, radius, 270))
    //     map.fitBounds(bounds);
    // }, [googleMaps, map, radius]);

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


    React.useEffect(() => {
        if (!googleMaps || !map) return;

        // console.log('markers', markers.current);

        const { LatLng, LatLngBounds, Marker, Animation, Point, Size } = googleMaps;
        // const { center, padding } = view || {};

        // const bounds = new LatLngBounds();

        const stations: string[] = [];

        for (const vehicleId in vehicles) {
            const { location, station } = vehicles[vehicleId];
            const stationId = station.id;
            const position = new LatLng(location.latitude, location.longitude);
            const marker = markers.current[stationId];

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

            markers.current[stationId] = newmarker;
        }

        for (const stationId in markers.current) {
            const marker = markers.current[stationId];
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
            delete markers.current[stationId];
        }

        // if (!bounds.isEmpty()) {
        //     map.fitBounds(bounds, {
        //         left: 50, top: 50, right: 50,
        //         bottom: padding,
        //     });
        // }

    }, [googleMaps, map, vehicles]);

    React.useEffect(() => {
        if (!googleMaps || !map || !vehicles || !view) return;
        // focus(view);
    }, [googleMaps, map, vehicles, view]);

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
                ref={mapRef}
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