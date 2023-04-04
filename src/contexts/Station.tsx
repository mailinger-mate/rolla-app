import React from 'react';
import { getStationsByH3Range, Station } from '../utils/db/station';
import { useH3Collection } from '../utils/hooks/useH3Collection';

type Stations = Record<string, Station>;

interface Context {
    stations?: Stations;
}

const StationContext = React.createContext<Context>({});

const useStationContext = () => React.useContext(StationContext);

const StationProvider = React.memo(({ children }) => {
    const stations = useH3Collection<Station>(getStationsByH3Range);
    console.log('stations', { stations })
    const context: Context = {
        stations,
    };

    return (
        <StationContext.Provider value={context}>
            {children}
        </StationContext.Provider>
    )
});

StationProvider.displayName = 'StationProvider';

export type {
    Stations,
}
export {
    StationProvider,
    useStationContext,
}
