import React from 'react';
import { geohashToPointFeature, geohashToPolygonFeature, geohashToPolygonGeometry, wrapAsFeatureCollection } from 'geohash-to-geojson';
import { defaultLocation } from '../../config';
import { useGoogleMapContext } from '../../contexts/GoogleMap';
import { useLocationContext } from '../../contexts/Location';
import { useStationContext } from '../../contexts/Station';
import { useVehicleContext } from '../../contexts/Vehicle';
import { Vehicle } from '../../utils/db/vehicle';
import { style } from '../../utils/map/style';
import { geohashesBetween } from '../../utils/geohashesBetween';
import { boundingBoxCoordinates, distanceBetween, Geohash, geohashQueryBounds, GeohashRange } from 'geofire-common';
import { cellsToMultiPolygon, cellToBoundary, cellToLatLng, edgeLength, getDirectedEdgeOrigin, getHexagonEdgeLengthAvg, gridDisk, H3Index, latLngToCell, polygonToCells, UNITS } from 'h3-js';
import './Map.css';

export interface View {
    center?: string[] | boolean;
    padding?: number;
}

interface Props {
    // center?: string[];
    // filter?: boolean;
    // padding?: number;
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

const randomColor = (lightness: number) => {
    const goldenAngle = 180 * (3 - Math.sqrt(5));
    return `hsl(${Math.random() * 10 * goldenAngle + 60}, 100%, ${Math.round(lightness * 100)}%)`;
};

const resolutions = [1100, 420, 160, 60, 20, 8, 3, 1, 0.5, 0.2, 0.1];

const getResolution = (radius: number) => {
    let index;
    for (index = 0; index < resolutions.length; index++) {
        if (radius / 1000 * 2 >= resolutions[index]) return index;
    }
    return index;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const StationMap = React.memo<Props>(({
    view,
    onClick,
    onFocus,
    onDrag,
}) => {
    const {
        cell,
        cellIndex,
        cellRadius,
        cellResolution,
        area,
        areaRadius,
        location,
        locationRadius,
        geohashRanges,
        geohashRangesExcluded,
        position,
        setLocation,
        setLocationBounds,
    } = useLocationContext();
    // const { stations } = useStationContext();
    const { vehicles, vehiclesCount } = useVehicleContext();
    const googleMaps = useGoogleMapContext();

    // console.log('map');
    // console.log('stations', stations, vehicles);

    const [map, setMap] = React.useState<google.maps.Map>();
    const mapRef = React.useRef<HTMLDivElement>(null);
    const positionMarker = React.useRef<google.maps.Marker>();

    // const [focus, setFocus] = React.useState<'position' | 'view'>();
    // const focus = React.useRef<'position' | 'center'>();

    React.useEffect(() => {
        console.log('position', position);
        if (!googleMaps || !position) return;
        const { LatLng } = googleMaps;
        const [latitude, longitude] = position;
        positionMarker.current?.setPosition(new LatLng(latitude, longitude));
    }, [googleMaps, position])

    const positionSymbol = React.useMemo(() => {
        if (!googleMaps) return;
        const { SymbolPath } = googleMaps;
        const symbol: google.maps.Symbol = {
            path: SymbolPath.CIRCLE,
            fillColor: 'royalblue',
            fillOpacity: 1,
            strokeWeight: 10,
            strokeOpacity: 0.2,
            scale: 5,
            strokeColor: 'royalblue',
        };
        return symbol;
    }, [googleMaps]);


    const [isZooming, setZooming] = React.useState(false);

    React.useEffect(() => {
        console.log('mapRef', mapRef.current, googleMaps)
        if (!mapRef.current || !googleMaps) return;
        const { Map, Marker, LatLng, Point, Animation } = googleMaps;

        const [latitude, longitude] = location || defaultLocation;
        const center = new LatLng(latitude, longitude);

        const map = new Map(mapRef.current, {
            center,
            zoom: 13,
            maxZoom: 16,
            // zoom: 6,
            minZoom: 4,
            disableDefaultUI: true,
            styles: style(prefersDark),
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

        // map.data.setStyle({
        //     strokeColor: '#ddd',
        //     strokeWeight: 1,
        //     fillOpacity: 0,
        // });

        map.data.setStyle((feature) => {
            const color = feature.getProperty('color');

            return {
                strokeColor: '#fff',
                strokeWeight: 2,
                fillOpacity: 0,
                // fillColor: color,
                label: {
                    text: 'test',
                    color: 'blue',
                    fontSize: '12px',
                },
                zIndex: 3,
            }
        })

        map.addListener('click', () => {
            onClick && onClick();
        })

        map.addListener('idle', () => {
            const center = map.getCenter();
            if (!center) return;
            setLocation([center.lat(), center.lng()]);

            const bounds = map.getBounds();
            if (!bounds) return bounds;
            const northEast = bounds?.getNorthEast();
            const southWest = bounds?.getSouthWest();
            setLocationBounds([
                [northEast.lat(), northEast.lng()],
                [southWest.lat(), southWest.lng()]
            ])
        });

        map.addListener('dragend', () => {
            onDrag && onDrag();
        });

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
        // })

        setMap(map);

        positionMarker.current = new Marker({
            map,
            position: new LatLng(latitude, longitude),
            // label: count ? count.toString() : '?',
            animation: Animation.DROP,
            icon: positionSymbol
        });

        // return map;

        // new Marker().setValues()
    }, [googleMaps, mapRef]);

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

    const geohashMarkers = React.useRef<Record<string, google.maps.Marker>>({});
    const geohashPolygons = React.useRef<Record<string, google.maps.Polygon>>({});

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



    const areaCircle = React.useRef<google.maps.Circle>();

    React.useEffect(() => {
        if (!cell || !cellRadius || !googleMaps || !map) return;

        const { Circle, LatLng } = googleMaps;
        const center = new LatLng(...cell);
        if (!areaCircle.current) {
            // areaCircle.current = new Circle({
            //     map,
            //     center,
            //     radius: cellRadius,
            //     strokeColor: 'tomato',
            //     strokeWeight: 1,
            //     fillOpacity: 0.1,
            // })
        } else {
            areaCircle.current.setCenter(center);
            areaCircle.current.setRadius(cellRadius);
        }
    }, [cell, cellRadius, googleMaps, map]);

    const cellMarkers = React.useRef<Record<H3Index, google.maps.Marker>>({});
    const cellPolygons = React.useRef<Record<H3Index, google.maps.Polygon>>({});

    React.useEffect(() => {
        for (const index in cellPolygons.current) {
            const marker = cellMarkers.current[index];
            const polygon = cellPolygons.current[index];
            polygon.setMap(null);
            marker.setMap(null);
        }
        cellPolygons.current = {};
        cellMarkers.current = {};
    }, [cellResolution]);

    const noSymbol = React.useMemo(() => {
        if (!googleMaps) return;
        const { SymbolPath } = googleMaps;
        const symbol: google.maps.Symbol = {
            fillOpacity: 0,
            strokeOpacity: 0,
            path: SymbolPath.CIRCLE,
        };
        return symbol;
    }, [googleMaps]);

    const max = Math.random() * 50;



    React.useEffect(() => {
        if (!cellIndex || !googleMaps || !map) return;

        const { LatLng, Marker, Polygon } = googleMaps;
        const disk = gridDisk(cellIndex, 3);

        let countMax = 0;
        const counts = disk.map(() => {
            const count = Math.round(Math.random() * 10);
            if (countMax < count) countMax = count;
            return count;
        });

        disk.forEach((h3Index, index) => {
            if (cellPolygons.current[h3Index]) return;
            const points = cellToBoundary(h3Index);
            const paths = points.map(([latitude, longitude]) => new LatLng(latitude, longitude));
            const position = new LatLng(...cellToLatLng(h3Index));
            const count = counts[index];
            const fillColor = `hsl(120deg, ${Math.max(Math.round(count / countMax * 100), 10)}%, 50%)`;
            console.log('color', fillColor);
            cellPolygons.current[h3Index] = new Polygon({
                paths,
                strokeColor: prefersDark ? '#444' : '#ddd',
                strokeWeight: 1,
                strokeOpacity: count ? 1 : 0,
                fillOpacity: count ? Math.random() / 5 : 0,
                fillColor,
                map,
                zIndex: 2
            });
            cellMarkers.current[h3Index] = new Marker({
                icon: noSymbol,
                label: {
                    text: '' + count,
                    fontSize: '2vmax',
                    className: 'cellLabel',
                    color: prefersDark ? '#ddd' : '#777'
                },
                opacity: count ? 1 : 0,
                map,
                optimized: true,
                position,
                // fillC
                zIndex: 1,
            });
        });
    }, [cellIndex, googleMaps, map]);

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
            strokeWeight: 1,
            strokeOpacity: 0.2
        };
        return symbol;
    }, [googleMaps]);

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
                icon: pinSymbol(count)
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