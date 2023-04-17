import React, { Reducer } from 'react';
import { defaultCoordinates, defaultDiameter, h3ResolutionMax, h3AreaRatio, h3ResolutionLocation as h3ResolutionLocation, locationDecimals } from '../config';
import { Geolocation } from '@capacitor/geolocation';
import { cellToChildren, H3Index, latLngToCell } from 'h3-js';

export type Coordinates = {
    lat: number;
    lng: number;
};

const h3Resolutions = [1100, 420, 160, 60, 20, 8, 3, 1, 0.5, 0.17, 0.06, 0.02, 0.009, 0.003, 0.001];

const areaToResolution = (diameter: number) => {
    let resolution;
    for (resolution = 0; resolution <= h3ResolutionLocation; resolution++) {
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
    h3IndexMax: H3Index;
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
    location?: Location;
    // locationRadius?: number;
    position?: Coordinates;
    scope?: boolean;
    // getLocation: () => Circle;
    // getAssetCell: () => H3Index;
    setLocation: (location: Partial<Circle>) => void;
    setScope: (scope: boolean) => void;
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
        .from(Array(h3ResolutionMax - h3Resolution).keys())
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

// const cellToMaxRange = (
//     h3Index: H3Index,
// ): [H3Index, H3Index] => {
//     console.log('range');
//     const cells = cellToChildren(h3Index, h3ResolutionMax);
//     console.log('range done');
//     return [cells[0], cells[cells.length - 1]]
// }

const calculateLocation = (
    { coordinates, diameter }: Circle,
    state?: Location,
): Location => {
    const { lat, lng } = coordinates;

    if (state?.coordinates.lat === lat
        && state?.coordinates.lng === lng
        && state?.diameter === diameter) return state;

    const h3Resolution = areaToResolution(diameter * h3AreaRatio);
    const h3Index = latLngToCell(lat, lng, h3Resolution);
    const h3IndexMax = latLngToCell(lat, lng, h3ResolutionMax);
    const [h3RangeStart, h3RangeEnd] = cellToRange(h3Index, h3Resolution);

    console.log('Location', h3Index, h3Resolution, coordinates, diameter);

    return {
        coordinates,
        diameter,
        h3IndexMax,
        h3Index,
        h3Resolution,
        h3RangeStart,
        h3RangeEnd,
    };
}

const defaultLocation: Circle = {
    coordinates: defaultCoordinates,
    diameter: defaultDiameter,
};

const LocationContext = React.createContext<Context>({
    // cell: calculateCell(defaultLocation),
    location: undefined,
    // getAssetCell: () => latLngToAssetCell(defaultCoordinates),
    setLocation: () => undefined,
    setScope: () => true,
    // getLocation: () => defaultLocation,
    // setLocationRadius: () => undefined,
    // zoom: () => undefined,
    watchPosition: () => undefined,
});

const useLocationContext = () => React.useContext(LocationContext);


const useDifferentCoordinates = (
    before: Coordinates | undefined,
    after: Coordinates,
) => {
    if (!before && after) return after;
    if (before && after && after.lat !== before.lat && after.lng !== before.lng) return after;
    return before;
};

// interface Loco {
//     coordinates: Coordinates;
//     radius: number;
// }

// interface LocationState extends Loco {

// }

const roundCoordinate = (
    coordinate: number
): number => {
    return +coordinate.toFixed(locationDecimals);
}

export const roundNewCoordinates = (
    after?: Coordinates,
    before?: Coordinates,
): Coordinates | undefined => {
    if (!after) return before;
    const { lat: latAfter, lng: lngAgter } = after;
    const lat = roundCoordinate(latAfter);
    const lng = roundCoordinate(lngAgter);
    if (lat !== before?.lat || lng !== before?.lng) return { lat, lng };
    return before;
}

const roundNewDiameter = (
    after?: number,
    before?: number,
): number | undefined => {
    if (!after) return before;
    const diameter = Math.round(after);
    if (diameter !== before) return diameter;
    return before;
}

const LocationProvider = React.memo(({ children }) => {
    const [position, setPosition] = React.useReducer(useDifferentCoordinates, undefined);

    const [scope, setScope] = React.useState(true);

    const [location, setLocation] = React.useReducer((
        state: Location | undefined,
        { coordinates: coordinatesAfter, diameter: diameterAfter }: Partial<Circle>
    ) => {
        if (!coordinatesAfter && !diameterAfter) return state;

        // if (!state) return 
        // const {
        //     coordinates: coordinatesBefore,
        //     diameter: diameterBefore,
        // } = state;
        
        const coordinates = roundNewCoordinates(coordinatesAfter, state?.coordinates);
        const diameter = roundNewDiameter(diameterAfter, state?.diameter);

        if (!coordinates || !diameter) return state;

        return calculateLocation({
            coordinates,
            diameter,
        }, state);

    }, undefined);

    // const [location, setLocation] = React.useReducer<
    //     Reducer<Location, Partial<Circle>>,
    //     undefined
    // >(
    //     (
    //         state,
    //         { coordinates: coordinatesAfter, diameter: diameterAfter }
    //     ) => {
    //         if (!coordinatesAfter && !diameterAfter) return state;

    //         const {
    //             coordinates: coordinatesBefore,
    //             diameter: diameterBefore,
    //         } = state;
    //         const coordinates = roundNewCoordinates(coordinatesBefore, coordinatesAfter);
    //         const diameter = diameterAfter && Math.round(diameterAfter);
    //         if (!coordinates && !diameter) return state;

    //         return calculateLocation({
    //             coordinates: coordinates || coordinatesBefore,
    //             diameter: diameter || diameterBefore,
    //         });
    //     },
    //     {
    //         coordinates: defaultCoordinates,
    //         diameter: defaultDiameter,
    //     },
    //     // undefined,
    //     calculateLocation,
    // );

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
            const { latitude: lat, longitude: lng } = position.coords;
            setPosition({ lat, lng });
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
        // cell,
        location,
        // locationRadius,
        // geohashRanges,
        // geohashRangesExcluded,
        position,
        scope,
        // getLocation,
        setLocation,
        setScope,
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
        scope,
    ]);

    return (
        <LocationContext.Provider value={context}>
            {children}
        </LocationContext.Provider>
    );
});

LocationProvider.displayName = 'LocationProvider';

export {
    LocationProvider,
    useLocationContext
};
