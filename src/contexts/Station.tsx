import React from 'react';
import { getStationsAt, Station } from '../utils/db/station';
import { useGeohashCollection } from '../utils/hooks/useGeohashCollection';

interface Context {
    stations?: Record<string, Station>;
}

const StationContext = React.createContext<Context>({});

const useStationContext = () => React.useContext(StationContext);

const StationProvider: React.FC = ({ children }) => {
    const stations = useGeohashCollection<Station>(getStationsAt);

    const context = React.useMemo<Context>(() => ({ stations }), [stations]);

    React.useEffect(() => {
        console.log('stations', stations);
    }, [stations])

    return (
        <StationContext.Provider value={context}>
            {children}
        </StationContext.Provider>
    )
};

export {
    StationProvider,
    useStationContext,
}
