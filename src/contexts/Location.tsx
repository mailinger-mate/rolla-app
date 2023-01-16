import React, { Reducer } from 'react';
import { defaultCoordinates, defaultDiameter as defaultDiameter, h3GeohashRatio, h3AssetResolution, locationMaxThreshold, locationMinThreshold, h3AreaRatio, h3MaxResolution, h3MinDiameter, locationDecimals } from '../config';
import { Geolocation } from '@capacitor/geolocation';
import { Geohash, geohashQueryBounds, GeohashRange } from 'geofire-common';
import { cellToChildren, cellToLatLng, getHexagonEdgeLengthAvg, H3Index, latLngToCell, UNITS } from 'h3-js';
import { sortGeohashes } from '../utils/sortGeohashes';
import { roundNewCoordinates } from '../utils/geo/roundCoordinates';

export type Coordinates = [number, number];

const h3Resolutions = [1100, 420, 160, 60, 20, 8, 3, 1, 0.5, 0.17, 0.06, 0.02, 0.009, 0.003, 0.001];

const areaToResolution = (diameter: number) => {
    let resolution;
    for (resolution = 0; resolution < h3MaxResolution; resolution++) {
        if (diameter >= h3Resolutions[resolution]) return resolution;
    }
    return resolution;
}

interface Point {
    coordinates: Coordinates;
}

interface Circle extends Point {
    diameter: number;
}

interface Location extends Circle {
    h3AssetIndex: H3Index;
    h3Index: H3Index;
    h3Resolution: number;
    // geohashRanges: GeohashRange[];
    // geohashesSorted: Geohash[][][];
    h3RangeStart: H3Index;
    h3RangeEnd: H3Index;
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
    // cell?: Cell;
    location: Location;
    // locationRadius?: number;
    position?: Coordinates;
    // getLocation: () => Circle;
    // getAssetCell: () => H3Index;
    setLocation: (location: Partial<Circle>) => void;
    // setLocationRadius: (radius: number) => void;
    // setLocationBounds: (bounds: [Coordinates, Coordinates]) => void;
    // zoom: (reducer?: 'in' | 'out') => void;
    watchPosition: (track?: boolean) => void;
}

const cellToChild = (
    h3StartIndex: string,
    h3Resolution: number,
    childIndex: number,
    // childResolution: number,
) => {
    return Array
        .from(Array(h3AssetResolution - h3Resolution).keys())
        .reduce((
            h3Index,
            resolution
        ) => {
            const cells = cellToChildren(h3Index, h3Resolution + resolution + 1);
            return cells[childIndex < 0
                ? cells.length + childIndex
                : childIndex];
        }, h3StartIndex);
}

const cellToRange = (
    h3Index: string,
    h3Resolution: number,
): [string, string] => {
    return [
        cellToChild(h3Index, h3Resolution, 0),
        cellToChild(h3Index, h3Resolution, -1),
    ];
}

const calculateLocation = ({
    coordinates,
    diameter,
}: Circle): Location => {
    const [latitude, longitude] = coordinates;

    const h3Resolution = areaToResolution(diameter * h3AreaRatio);
    const h3Index = latLngToCell(latitude, longitude, h3Resolution);
    const h3AssetIndex = latLngToCell(latitude, longitude, h3AssetResolution);
    const [h3RangeStart, h3RangeEnd] = cellToRange(h3Index, h3Resolution);

    return {
        coordinates,
        diameter,
        h3AssetIndex,
        h3Index,
        h3Resolution,
        h3RangeStart,
        h3RangeEnd,
    };
}

// const calculateCell = (
//     { coordinates, diameter }: Partial<Circle>,
//     state?: Location,
// ): Location => {
//     if (!coordinates && !diameter) return state;
//     const roundedCoordinates = roundNewCoordinates(coordinates);
//     const roundedDiameter = Math.round(diameter);

//     if (state) {
//         const [stateLatitude, stateLongitude] = state.coordinates;
//         console.log('cell diff', stateLatitude, latitude, stateLongitude, longitude, state.diameter, diameter)
//         if (
//             latitude == stateLatitude
//             && longitude === stateLongitude
//             && diameter === state.diameter
//         ) {
//             return state;
//         }
//     }

//     const h3Resolution = areaToResolution(diameter * h3AreaRatio);
//     const h3Index = latLngToCell(latitude, longitude, h3Resolution);
//     const h3AssetIndex = latLngToCell(latitude, longitude, h3AssetResolution);

//     const h3Range = state && state.h3Index === h3Index
//         ? state.h3Range
//         : cellToRange(h3Index, h3Resolution);


//     // const geohashRanges = geohashQueryBounds(h3Center, h3Radius * h3GeohashRatio);
//     // const geohashesSorted = sortGeohashes(geohashRanges, h3Center, h3Radius);
//     // console.log('h3Children', cellToChildren(h3Index, 9));

//     // console.log('h3', diameter, h3Index, h3Resolution, h3Range);

//     // console.log('sorted', JSON.stringify(geohashesSorted.map(([outside, inside]) => inside)));
//     return {
//         coordinates: [latitude, longitude],
//         diameter,
//         h3AssetIndex,
//         h3Index,
//         h3Resolution,
//         // coordinates,
//         // geohashRanges,
//         // geohashesSorted,
//         h3Range,
//         // diameter,
//     };
// }

const defaultLocation: Circle = {
    coordinates: defaultCoordinates,
    diameter: defaultDiameter,
};

const LocationContext = React.createContext<Context>({
    // cell: calculateCell(defaultLocation),
    location: calculateLocation(defaultLocation),
    // getAssetCell: () => latLngToAssetCell(defaultCoordinates),
    setLocation: () => undefined,
    // getLocation: () => defaultLocation,
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

    // const [location, setLocation] = React.useState<Circle>({
    //     coordinates: defaultCoordinates,
    //     diameter: defaultDiameter,
    // });

    const [location, setLocation] = React.useReducer<
        Reducer<Location, Partial<Circle>>,
        Circle
    >(
        (
            state,
            { coordinates: coordinatesAfter, diameter: diameterAfter }
        ) => {
            if (!coordinatesAfter && !diameterAfter) return state;

            const {
                coordinates: coordinatesBefore,
                diameter: diameterBefore,
            } = state;
            const coordinates = roundNewCoordinates(coordinatesBefore, coordinatesAfter);
            const diameter = diameterAfter && Math.round(diameterAfter);
            if (!coordinates && !diameter) return state;

            return calculateLocation({
                coordinates: coordinates || coordinatesBefore,
                diameter: diameter || diameterBefore,
            });
        },
        {
            coordinates: defaultCoordinates,
            diameter: defaultDiameter,
        },
        calculateLocation,
    );

    // const getAssetCell = React.useCallback(() => {
    //     return latLngToAssetCell(location.coordinates);
    // }, [location]);


    // React.useEffect(() => {
    //     setCell(location);
    // }, [location]);

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

    const getLocation = React.useCallback(() => {
        return location;
    }, [location]);

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
        // cell,
        location,
        // locationRadius,
        // geohashRanges,
        // geohashRangesExcluded,
        position,
        // getLocation,
        setLocation,
        // setLocationBounds,
        // setLocationRadius,
        // zoom,
        watchPosition,
    }), [
        // cell,
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
