import React from 'react';
import { defaultRegion } from '../config';

type Location = [number, number];

interface Context {
    location?: Location;
    setLocation: (location: Location) => void;
}

const LocationContext = React.createContext<Context>({
    setLocation: () => undefined,
    // location: defaultRegion as Location,
});

const useLocationContext = () => React.useContext(LocationContext);

const LocationProvider: React.FC = ({ children }) => {
    const [location, setLocation] = React.useReducer((previous: Location | undefined, next: Location) => {
        if (!previous && next) return next;
        if (previous && next && next[0] !== previous[0] && next[1] !== previous[1]) return next;
        return previous;
    }, undefined);


    const context = React.useMemo<Context>(() => ({
        location,
        setLocation,
    }), [location]);

    return (
        <LocationContext.Provider value={context}>
            {children}
        </LocationContext.Provider>
    )
};

export {
    LocationProvider,
    useLocationContext
};
