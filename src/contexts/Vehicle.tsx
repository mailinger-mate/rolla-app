import React from 'react';
import { getVehiclesAt } from '../utils/db/vehicle';
import { Vehicle } from '../utils/db/vehicle';
import { H3Aggregates, useH3Aggregates } from '../utils/hooks/useH3Aggregates';
import { useH3Collection } from '../utils/hooks/useH3Collection';

type Vehicles = Record<string, Vehicle>;

interface Context {
    vehicles?: Vehicles;
    vehiclesAggregate: H3Aggregates;
}

const VehicleContext = React.createContext<Context>({
    vehiclesAggregate: {
        cells: {}
    }
});

const useVehicleContext = () => React.useContext(VehicleContext);

const VehicleProvider: React.FC = ({ children }) => {
    // const { zoom, setLocation } = useLocationContext();
    const vehicles = useH3Collection(getVehiclesAt); // useGeohashCollection<Vehicle>(getVehiclesAt);
    const vehiclesAggregate = useH3Aggregates(getVehiclesAt); //useGeohashCount<Vehicle>(getVehiclesAt);

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
        vehiclesAggregate,
    }), [
        vehicles,
        vehiclesAggregate,
    ]);

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
