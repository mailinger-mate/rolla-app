import React from 'react';
import { defaultLocation, defaultRadius as defaultRadius, maxRadius, minRadius } from '../config';
import { Geolocation } from '@capacitor/geolocation';
import { boundingBoxCoordinates, distanceBetween, geohashQueryBounds, GeohashRange, Geopoint } from 'geofire-common';
import { cellToLatLng, getHexagonEdgeLengthAvg, gridDisk, H3Index, latLngToCell, UNITS } from 'h3-js';
import { km } from '../utils/distance';
import { geohashesBetween } from '../utils/geohashesBetween';
import Geohash from 'latlon-geohash';

type Location = [number, number];

const h3Resolutions = [1100, 420, 160, 60, 20, 8, 3, 1, 0.5, 0.2, 0.1];

const getCellResolution = (radius: number) => {
    let index;
    for (index = 0; index < h3Resolutions.length; index++) {
        if (radius / 1000 * 2 >= h3Resolutions[index]) return index;
    }
    return index;
}

interface Context {
    area?: Location;
    areaRadius: number;
    cell?: Location;
    cellIndex?: H3Index;
    cellRadius?: number;
    cellResolution?: number;
    geohashRanges?: GeohashRange[];
    geohashRangesExcluded?: string[][];
    location?: Location;
    locationRadius?: number;
    position?: Location;
    setLocation: (location: Location) => void;
    setLocationBounds: (bounds: [Location, Location]) => void;
    zoom: (reducer?: 'in' | 'out') => void;
    watchPosition: (track?: boolean) => void;
}

const LocationContext = React.createContext<Context>({
    areaRadius: defaultRadius,
    setLocation: () => undefined,
    setLocationBounds: () => undefined,
    zoom: () => undefined,
    watchPosition: () => undefined,
});

const useLocationContext = () => React.useContext(LocationContext);

const useDifferent = (
    before: Location | undefined,
    after: Location,
) => {
    if (!before && after) return after;
    if (before && after && after[0] !== before[0] && after[1] !== before[1]) return after;
    return before;
}

const LocationProvider = React.memo(({ children }) => {
    const [position, setPosition] = React.useReducer(useDifferent, undefined);

    const [location, setLocation] = React.useReducer(useDifferent, defaultLocation as Location);
    const [locationBounds, setLocationBounds] = React.useState<[Location, Location]>();
    const [locationRadius, setLocationRadius] = React.useState(defaultRadius)

    const [geohashRanges, setGeohashRanges] = React.useReducer((
        before: GeohashRange[] | undefined,
        after: GeohashRange[],
    ) => {
        if (!before && after) return after;
        if (before && after) {
            const isEqual = before.length === after.length && after.every(([startAfter, endAfter], index) => {
                const [startBefore, endBefore] = before[index];
                return startAfter === startBefore && endAfter === endBefore;
            });
            if (!isEqual) return after;
        }
        return before;
    }, undefined);

    const [geohashRangesExcluded, setGeohashRangesExlcuded] = React.useState<string[][]>();

    const [area, setArea] = React.useState<Location>();
    const [areaRadius, setAreaRadius] = React.useState(defaultRadius);

    const zoom = React.useCallback((
        direction: 'in' | 'out' | undefined,
    ) => {
        if (!direction) return areaRadius;
        if (direction === 'in' && areaRadius < minRadius || areaRadius > maxRadius) return;
        setAreaRadius(areaRadius * (direction === 'in' ? 0.25 : 4));
    }, [areaRadius]);

    
    const [cell, setCell] = React.useState<Location>();
    const [cellIndex, setCellIndex] = React.useState<string>();
    const [cellRadius, setCellRadius] = React.useState<number>();
    const [cellResolution, setCellResolution] = React.useState<number>();

    // const [areaDisk, setAreaDisk] = React.useState<string[]>();

    // React.useEffect(() => {
    //     if (!location) return;
    //     // if (!area) return setArea(location);
    //     // if (!locationBounds) return;
    
    //     // const locationRadius = Math.ceil(distanceBetween(...locationBounds) / 20) * km;
    //     // setLocationRadius(locationRadius);
    //     // console.log('location radius', locationRadius)
    //     // const distance = Math.round(distanceBetween(location, area)) * 1e3;
    //     // console.log('area distance', distance);
    //     // console.log('scale', locationRadius / radius)

    //     // const isOutside = radius < (Math.sqrt((location[0] - area[0]) ^ 2 + (location[1] - area[1]) ^ 2)) + locationRadius;
        
    //     // const isOutside = distance + locationRadius > radius;

    //     if (locationRadius < radius / 3 || locationRadius > radius * 2 / 3) {
    //         setRadius(locationRadius * 2);
    //     }
    //     // if (isOutside) {
    //     //     setArea(location);
    //     // }
    // }, [
    //     // area,
    //     radius,
    //     location,
    //     locationBounds,
    // ]);

    React.useEffect(() => {
        if (!locationBounds) return;
        const locationRadius = Math.ceil(distanceBetween(...locationBounds) / 20) * km;
        console.log('locationRadius', locationRadius);
        setLocationRadius(locationRadius);
    }, [locationBounds]);

    React.useEffect(() => {
        if (!locationRadius) return;
        if (areaRadius && locationRadius > areaRadius / 3 && locationRadius < areaRadius * 2 / 3) return;
        console.log('areaRadius')
        setAreaRadius(locationRadius * 2);
        
    }, [locationRadius, areaRadius]);

    React.useEffect(() => {
        if (!location) return;
        if (!area) return setArea(location);
        const distance = Math.round(distanceBetween(location, area)) * 1e3;
        const isOutside = distance + locationRadius > areaRadius;
        if (isOutside) setArea(location);
    }, [area, areaRadius, location]);

    React.useEffect(() => {
        if (!area || !areaRadius) return;

        const resolution = getCellResolution(areaRadius);
        const cell = latLngToCell(...area, resolution);
        const edge = getHexagonEdgeLengthAvg(resolution, UNITS.m);
        const radius = edge * 0.8;
        const center = cellToLatLng(cell);

        const ranges = geohashQueryBounds(center, radius);

        const rangesExcluded = ranges.map(([start, end]) => {
            const geohashes = geohashesBetween(start, end);
            const invalid: [string, number][] = [];

            geohashes.forEach(geohash => {
                try {
                    const { lat, lon } = Geohash.decode(geohash);
                    const distance = distanceBetween(center, [lat, lon]);
                    if (distance < radius * 2 / km) return;
                    invalid.push([geohash, distance]);
                } catch {
                    invalid.push([geohash, Infinity]);
                }
            });

            invalid.sort((a, b) => a[1] - b[1]);

            return invalid.reduce((
                exclude: string[],
                [geohash],
            ) => {
                if (exclude.length < 10 ) exclude.push(geohash);
                return exclude;
            }, []);
        });
        console.log('excluded', rangesExcluded)

        setGeohashRanges(ranges);
        setGeohashRangesExlcuded(rangesExcluded);
        setCell(center);
        setCellIndex(cell);
        setCellRadius(radius);
        setCellResolution(resolution);
    }, [area, areaRadius])

    // React.useEffect(() => {
    //     if (!area) return;
    //     setGeohashRanges(geohashQueryBounds(area, areaRadius));
    //     // setGeohashBounds(boundingBoxCoordinates(location, radius));
    // }, [area, areaRadius]);

    React.useEffect(() => {
        if (!geohashRanges) return;
        console.log('locationQueryBounds', JSON.stringify(geohashRanges));
    }, [geohashRanges])

    const id = React.useRef<string>();

    const clearWatch = () => {
        if (id.current) Geolocation.clearWatch({ id: id.current });
    }

    const watchPosition = React.useCallback(async (
        track = false
    ) => {
        clearWatch();
        id.current = await Geolocation.watchPosition({
            maximumAge: 30000,
        }, (position) => {
            if (!position) return;
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
        });
    }, []);

    React.useEffect(clearWatch, []);

    // const zoom = React.useCallback((out = false) => {
    //     if (out === true && radius > maxRadius || out === false && radius < minRadius) return;
    //     setRadius(radius * (out === true ? 10 : out === false ? 0.1 : defaultRadius));
    // }, [radius]);

    const context = React.useMemo<Context>(() => ({
        area,
        areaRadius,
        cell,
        cellIndex,
        cellRadius,
        cellResolution,
        location,
        locationRadius,
        geohashRanges,
        geohashRangesExcluded,
        position,
        setLocation,
        setLocationBounds,
        zoom,
        watchPosition,
    }), [
        area,
        areaRadius,
        cell,
        cellIndex,
        cellRadius,
        cellResolution,
        geohashRanges,
        geohashRangesExcluded,
        location,
        locationRadius,
        position,
    ]);

    return (
        <LocationContext.Provider value={context}>
            {children}
        </LocationContext.Provider>
    );
});

export {
    LocationProvider,
    useLocationContext
};
