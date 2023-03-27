import React from 'react';
import { getAssetsByH3Range } from '../utils/db/asset';
import { Asset } from '../utils/db/asset';
import { H3Aggregates, useH3Aggregates } from '../utils/hooks/useH3Aggregates';
import { useH3Collection } from '../utils/hooks/useH3Collection';

type Vehicles = Record<string, Asset>;

interface Context {
    vehicles?: Vehicles;
    vehiclesAggregate: H3Aggregates;
}

const AssetContext = React.createContext<Context>({
    vehiclesAggregate: {
        cells: {}
    }
});

const useAssetContext = () => React.useContext(AssetContext);

const AssetProvider: React.FC = ({ children }) => {
    // const { zoom, setLocation } = useLocationContext();
    const vehicles = useH3Collection(getAssetsByH3Range); // useGeohashCollection<Vehicle>(getVehiclesAt);
    const vehiclesAggregate = useH3Aggregates(getAssetsByH3Range); //useGeohashCount<Vehicle>(getVehiclesAt);

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
        <AssetContext.Provider value={context}>
            {children}
        </AssetContext.Provider>
    )
};

export {
    AssetProvider,
    useAssetContext,
}
