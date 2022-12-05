import React from 'react';
import { getVehiclesAt } from '../utils/db/vehicle';
import { Vehicle } from '../utils/db/vehicle';
import { useGeohashCollection } from '../utils/hooks/useGeohashCollection';

type Vehicles = Record<string, Vehicle>;

interface Context {
    vehicles?: Vehicles;
}

const VehicleContext = React.createContext<Context>({});

const useVehicleContext = () => React.useContext(VehicleContext);

const VehicleProvider: React.FC = ({ children }) => {
    const vehicles = useGeohashCollection<Vehicle>(getVehiclesAt);
    const context = React.useMemo<Context>(() => ({ vehicles }), [vehicles]);

    React.useEffect(() => {
        if (!vehicles) return;
        console.log('vehicles', vehicles);
    }, [vehicles])

    return (
        <VehicleContext.Provider value={context}>
            {children}
        </VehicleContext.Provider>
    )
};

export {
    VehicleProvider,
    useVehicleContext,
}
