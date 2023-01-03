import React, { Reducer } from 'react';
import { defaultLocation, defaultRadius as defaultRadius } from '../config';
import { Geolocation } from '@capacitor/geolocation';
import { Geohash, geohashQueryBounds, GeohashRange } from 'geofire-common';
import { cellToLatLng, getHexagonEdgeLengthAvg, latLngToCell, UNITS } from 'h3-js';
import { geohashesDistant } from '../utils/geohashesDistant';

export type Coordinates = [number, number];

const h3Resolutions = [1100, 420, 160, 60, 20, 8, 3, 1, 0.5, 0.2, 0.1];

const getCellResolution = (radius: number) => {
    let index;
    for (index = 0; index < h3Resolutions.length; index++) {
        if (radius / 1000 * 2 >= h3Resolutions[index]) return index;
    }
    return index;
}


interface Circle {
    coordinates: Coordinates;
    radius: number;
}

interface Area extends Circle {
    cellIndex: string;
    geohashRanges: GeohashRange[];
    geohashesExcluded: Geohash[][];
}

interface Context {
    // area?: Area;
    // areaRadius: number;
    // cell?: Cell;
    // cellIndex?: H3Index;
    // cellRadius?: number;
    // cellResolution?: number;
    // geohashRanges?: GeohashRange[];
    // geohashRangesExcluded?: string[][];
    location: Area;
    // locationRadius?: number;
    position?: Coordinates;
    setLocation: (location: Circle) => void;
    // setLocationRadius: (radius: number) => void;
    // setLocationBounds: (bounds: [Coordinates, Coordinates]) => void;
    // zoom: (reducer?: 'in' | 'out') => void;
    watchPosition: (track?: boolean) => void;
}

const calculateArea = (
    state: Area | undefined,
    area: Circle
): Area => {
    const { coordinates, radius } = area;

    const cellResolution = getCellResolution(radius);
    const cellIndex = latLngToCell(...coordinates, cellResolution);

    if (state && state.cellIndex === cellIndex) return state;

    const cellRadius = getHexagonEdgeLengthAvg(cellResolution, UNITS.m);
    const cellCenter = cellToLatLng(cellIndex);

    const geohashRanges = geohashQueryBounds(cellCenter, cellRadius * 0.8);
    const geohashesExcluded = geohashesDistant(geohashRanges, cellCenter, cellRadius);

    return {
        cellIndex,
        coordinates,
        geohashRanges,
        geohashesExcluded,
        radius,
    };
}

const LocationContext = React.createContext<Context>({
    location: calculateArea(undefined, {
        coordinates: defaultLocation,
        radius: defaultRadius,
    }),
    setLocation: () => undefined,
    // setLocationRadius: () => undefined,
    // zoom: () => undefined,
    watchPosition: () => undefined,
});

const useLocationContext = () => React.useContext(LocationContext);


const useDifferent = (
    before: Coordinates | undefined,
    after: Coordinates,
) => {
    if (!before && after) return after;
    if (before && after && after[0] !== before[0] && after[1] !== before[1]) return after;
    return before;
};

// interface Loco {
//     coordinates: Coordinates;
//     radius: number;
// }

// interface LocationState extends Loco {

// }


const LocationProvider = React.memo(({ children }) => {
    const [position, setPosition] = React.useReducer(useDifferent, undefined);

    // const [location, setLocation] = React.useReducer(useDifferent, defaultLocation as Coordinates);
    // const [locationBounds, setLocationBounds] = React.useState<[Coordinates, Coordinates]>();
    // const [location, setLocation] = React.useState<Circle>({
    //     coordinates: defaultLocation,
    //     radius: defaultRadius,
    // });

    // const [location, setLocation] = React.useReducer<Reducer<Circle, Partial<Circle>>>((
    //     state,
    //     { coordinates, radius },
    // ) => {
    //     return {
    //         coordinates: coordinates || state.coordinates,
    //         radius: radius || state.radius,
    //     };
    // }, {
    //     coordinates: defaultLocation,
    //     radius: defaultRadius,
    // })

    // const [loco, setLoco] = React.useReducer((
    //     state: LocationState | undefined,
    //     { coordinates, radius }: Loco
    // ) => {
    //     const area = 
    //     return state;
    // }, undefined);

    // const [geohashRanges, setGeohashRanges] = React.useReducer((
    //     before: GeohashRange[] | undefined,
    //     after: GeohashRange[],
    // ) => {
    //     if (!before && after) return after;
    //     if (before && after) {
    //         const isEqual = before.length === after.length && after.every(([startAfter, endAfter], index) => {
    //             const [startBefore, endBefore] = before[index];
    //             return startAfter === startBefore && endAfter === endBefore;
    //         });
    //         if (!isEqual) return after;
    //     }
    //     return before;
    // }, undefined);

    // const [geohashRangesExcluded, setGeohashRangesExlcuded] = React.useState<string[][]>();

    // const [area, setArea] = React.useState<Coordinates>();
    // const [areaRadius, setAreaRadius] = React.useState(defaultRadius);

    // const zoom = React.useCallback((
    //     direction: 'in' | 'out' | undefined,
    // ) => {
    //     if (!direction) return areaRadius;
    //     if (direction === 'in' && areaRadius < minRadius || areaRadius > maxRadius) return;
    //     setAreaRadius(areaRadius * (direction === 'in' ? 0.25 : 4));
    // }, [areaRadius]);


    // const [cell, setCell] = React.useReducer((
    //     before: Cell | undefined,
    //     after: Cell,
    // ) => {
    //     if (after && after.h3Index !== before?.h3Index) return after;
    //     return before;
    // }, undefined);
    // const [cellIndex, setCellIndex] = React.useState<string>();
    // const [cellRadius, setCellRadius] = React.useState<number>();
    // const [cellResolution, setCellResolution] = React.useState<number>();

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

    // React.useEffect(() => {
    //     if (!locationBounds) return;
    //     const locationRadius = Math.ceil(distanceBetween(...locationBounds) / 20) * km;
    //     console.log('locationRadius', locationRadius);
    //     setLocationRadius(locationRadius);
    // }, [locationBounds]);

    // React.useEffect(() => {
    //     if (!locationRadius) return;
    //     if (areaRadius && locationRadius > areaRadius / 3 && locationRadius < areaRadius * 2 / 3) return;
    //     console.log('areaRadius')
    //     setAreaRadius(locationRadius * 2);

    // }, [locationRadius, areaRadius]);

    // React.useEffect(() => {
    //     if (!location) return;
    //     if (!area) return setArea(location);
    //     const distance = Math.round(distanceBetween(location, area)) * km;
    //     const isOutside = distance + locationRadius > areaRadius;
    //     if (isOutside) setArea(location);
    // }, [area, areaRadius, location]);

    const [location, setLocation] = React.useReducer<Reducer<Area, Circle>>((
        state,
        area
    ) => {
        if (state) {
            const { radius } = state;
            const isLarger = area.radius > radius * 2 / 3;
            const isSmaller = area.radius < radius / 3;
            if (!isSmaller && !isLarger) return state;
        }

        return calculateArea(state, area);
    }, calculateArea(undefined, {
        coordinates: defaultLocation,
        radius: defaultRadius,
    }));

    // React.useEffect(() => {
    //     if (!location || !locationRadius) return;
    //     setArea({
    //         coordinates: location,
    //         radius: locationRadius,
    //     })
    // }, [location, locationRadius]);

    // const cellIndex = React.useRef<string>();

    // React.useEffect(() => {
    //     if (!area || !areaRadius) return;

    //     const resolution = getCellResolution(areaRadius);
    //     const h3Index = latLngToCell(...area, resolution);
    //     if (cellIndex.current === h3Index) return;

    //     const edge = getHexagonEdgeLengthAvg(resolution, UNITS.m);
    //     const radius = edge * 0.8;
    //     const center = cellToLatLng(h3Index);
    //     const geohashRanges = geohashQueryBounds(center, radius);
    //     const geohashesExcluded = geohashesDistant(geohashRanges, center, radius);
    //     // console.log('excluded', rangesExcluded)

    //     // setGeohashRanges(geohashRanges);
    //     // setGeohashRangesExlcuded(geohashesExcluded);

    //     cellIndex.current = h3Index;

    //     setCell({
    //         h3Index,
    //         geohashRanges,
    //         geohashesExcluded,
    //     });
    //     // setCellIndex(h3Index);
    //     // setCellRadius(radius);
    //     // setCellResolution(resolution);
    // }, [area, areaRadius])

    // React.useEffect(() => {
    //     if (!area) return;
    //     setGeohashRanges(geohashQueryBounds(area, areaRadius));
    //     // setGeohashBounds(boundingBoxCoordinates(location, radius));
    // }, [area, areaRadius]);

    // React.useEffect(() => {
    //     if (!geohashRanges) return;
    //     console.log('cell', JSON.stringify(geohashRanges));
    // }, [cell])

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
        // area,
        // areaRadius,
        // cell,
        // cellIndex,
        // cellRadius,
        // cellResolution,
        location,
        // locationRadius,
        // geohashRanges,
        // geohashRangesExcluded,
        position,
        setLocation,
        // setLocationBounds,
        // setLocationRadius,
        // zoom,
        watchPosition,
    }), [
        // area,
        // areaRadius,
        // cell,
        // cellIndex,
        // cellRadius,
        // cellResolution,
        // geohashRanges,
        // geohashRangesExcluded,
        location,
        // locationRadius,
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
