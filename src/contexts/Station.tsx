import React from 'react';
import { getStationsAt, Station } from '../utils/db/station';
import { getVehiclesAt, Vehicle } from '../utils/db/vehicle';
import { useGeohashCollection } from '../utils/hooks/useGeohashCollection';

interface Context {
    stations?: Record<string, Station>;
    // vehicles?: Record<string, Vehicle>;
}

const StationContext = React.createContext<Context>({});

const useStationContext = () => React.useContext(StationContext);

const StationProvider: React.FC = ({ children }) => {
    const stations = useGeohashCollection<Station>(getStationsAt);
    // const vehicles = useGeohashCollection<Vehicle>(getVehiclesAt);

    const context = React.useMemo<Context>(() => ({ stations }), [stations]);

    React.useEffect(() => {
        console.log('stations', stations);
        // console.log('vehicles', vehicles);
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
