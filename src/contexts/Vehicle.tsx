import React from 'react';
import { getVehiclesAt } from '../utils/db/vehicle';
import { Vehicle } from '../utils/db/vehicle';
import { Count, useGeohashCount } from '../utils/hooks/useGeohashCount';

type Vehicles = Record<string, Vehicle>;

interface Context {
    vehicles?: Vehicles;
    vehiclesCount?: Count;
}

const VehicleContext = React.createContext<Context>({});

const useVehicleContext = () => React.useContext(VehicleContext);

const VehicleProvider: React.FC = ({ children }) => {
    // const { zoom, setLocation } = useLocationContext();
    const vehicles = {} // useGeohashCollection<Vehicle>(getVehiclesAt);
    const vehiclesCount = useGeohashCount<Vehicle>(getVehiclesAt);

    // const [isLocating, setLocating] = React.useState(false);

    // React.useEffect(() => {
    //     if (!isLocating || vehicles) return;
    //     zoom('out');
    //     const interval = setInterval(() => zoom('out'), 1000);
    //     return () => clearInterval(interval);
    // }, [isLocating]);
    

    // React.useEffect(() => {
    //     if (!vehicles || !isLocating) return;
    //     setLocating(false);
    //     const { location: { latitude, longitude } } = Object.values(vehicles)[0];
    //     setLocation([latitude, longitude]);
    //     zoom();
    //     console.log('vehicles', vehicles);
    // }, [isLocating, vehicles]);

    // const locate = () => {
    //     setLocating(true);
    // }

    const context = React.useMemo<Context>(() => ({
        vehicles,
        vehiclesCount,
    }), [vehicles]);

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
