import React from 'react';
import { onSnapshot, Unsubscribe, QuerySnapshot } from 'firebase/firestore';
import { geohashQueryBounds, GeohashRange } from 'geofire-common';
import { getStationsAt, Station } from '../utils/db/station';
import { Vehicle } from '../utils/db/vehicle';
import { useFirebaseContext } from './Firebase';

type Location = [number, number];

type Stations = Record<string, Station>;
type Vehicles = Record<string, Record<string, Vehicle>>;

interface Context {
    setLocation: (location: Location) => void;
    stations?: Stations;
    vehicles?: Vehicles;
}

const radius = 30 * 1000;

const StationContext = React.createContext<Context>({
    setLocation: () => undefined,
});

export const useStationContext = () => React.useContext(StationContext);


interface StationListener {
    geohashRange: GeohashRange;
    // name: string;
    id: number;
    unsubscribe: Unsubscribe;
}

const id = () => {
    return Math.floor(Math.random() * 100000);
}


const clearState = (
    geohashRangesCleared: GeohashRange[],
    previousStations?: Stations,
): Stations => {
    const stations: Stations = {};

    for (const id in previousStations) {
        const previousStation = previousStations[id];
        const { geohash } = previousStation;
        const isCleared = geohashRangesCleared.reduce((isCleared, [start, end]) => {
            if (geohash >= start && geohash <= end) isCleared = true;
            return isCleared;
        }, false);

        // console.log('isCleared', isCleared, previousStation.name, geohash);
    
        if (!isCleared) {
            stations[id] = previousStation;
            continue;
        }

        // unsubscribe vehicles
    }

    return stations;
}

const appendState = (
    stationsQuery: QuerySnapshot<Station>,
    previousStations?: Stations,
): Stations => {
    const stations = Object.assign({}, previousStations);

    stationsQuery.docChanges().forEach(({ type, doc }) => {
        const stationId = doc.ref.id;
        console.log('docChanges', type, doc.data())
        switch (type) {
            case 'removed': {
                delete stations[stationId];
                // unsubscribe vehicles
                break;
            }
            default: {
                console.log(stations[stationId] ? 'modify station ' : 'add station', stationId);
                stations[stationId] = doc.data();
            }
        }
    });

    return stations;
};

const StationProvider: React.FC = ({ children }) => {
    const { db } = useFirebaseContext();

    const [location, setLocation] = React.useReducer((location: Location | undefined, newLocation: Location) => {
        if (!location && newLocation) return newLocation;
        if (location && newLocation && newLocation[0] !== location[0] && newLocation[1] !== location[1]) return newLocation;
        return location;
    }, undefined);

    const [stations, setStations] = React.useState<Stations>();
    const stationListeners = React.useRef<StationListener[]>([]);

    React.useEffect(() => {
        return () => {
            console.log('unmount, clean up list');
            stationListeners.current.forEach(listener => listener.unsubscribe())
        }
    }, []);


    React.useEffect(() => {
        if (!location) return;

        const geohashRangesHere = geohashQueryBounds(location, radius);
        const geohashRangesAway: GeohashRange[] = [];

        let listenerIndex = stationListeners.current.length;

        while (listenerIndex--) {
            const listener = stationListeners.current[listenerIndex];
            const [listenerStart, listenerEnd] = listener.geohashRange;
            const rangeIndex = geohashRangesHere.findIndex(([start, end]) =>
                start === listenerStart && end === listenerEnd);
            const inRange = rangeIndex >= 0;

            if (inRange) {
                // console.log('inRange', listener.geohashRange)
                geohashRangesHere.splice(rangeIndex, 1);
                continue;
            }

            // console.log('outRange', listener.geohashRange);
            geohashRangesAway.push(listener.geohashRange);
            stationListeners.current.splice(listenerIndex, 1);
            listener.unsubscribe();
        }

        if (geohashRangesAway.length) {
            setStations(previousStations =>
                clearState(geohashRangesAway, previousStations));
        }
        
        geohashRangesHere.forEach(geohashRange => {
            // console.log('newRange', geohashRange)
            stationListeners.current.push({
                unsubscribe: onSnapshot(getStationsAt(db, geohashRange), stationQuery => {
                    setStations(previousStations =>
                        appendState(stationQuery, previousStations))
                }),
                geohashRange,
                id: id(),
            });
        });

        console.log(JSON.stringify(stationListeners.current));
        
    }, [location]);

    React.useEffect(() => {
        if (!stations) return;
        console.log('stations', stations);
    }, [stations])
    

    const context = React.useMemo<Context>(() => ({
        stations,
        setLocation,
    }), [stations]);


    return (
        <StationContext.Provider value={context}>
            {children}
        </StationContext.Provider>
    )
};

export default StationProvider;
