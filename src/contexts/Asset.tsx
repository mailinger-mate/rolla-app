import React from 'react';
import { getAssetsByH3Range } from '../utils/db/asset';
import { Asset } from '../utils/db/asset';
import { H3Aggregates, useH3Aggregates } from '../utils/hooks/useH3Aggregates';
import { useH3Collection } from '../utils/hooks/useH3Collection';

type Assets = Record<string, Asset>;
type AssetsByStation = Record<string, number>;

interface Context {
    assets?: Assets;
    assetsByLocation: H3Aggregates;
    assetsByStation?: AssetsByStation;
}

const AssetContext = React.createContext<Context>({
    assetsByLocation: {
        cells: {}
    },
});

const useAssetContext = () => React.useContext(AssetContext);

const AssetProvider = React.memo(({ children }) => {
    // const { zoom, setLocation } = useLocationContext();
    const assets = useH3Collection(getAssetsByH3Range);
    const assetsByLocation = useH3Aggregates(getAssetsByH3Range);

    const assetsByStation = React.useMemo<AssetsByStation | undefined>(() => {
        if (!assets) return undefined;
        const aggregate: AssetsByStation = {};
        console.log({ assets })
        for (const key in assets) {
            const { station: { id } } = assets[key];
            const count = aggregate[id] || 0;
            aggregate[id] = count + 1;
        }
        return aggregate;
    }, [
        assets
    ]);

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

    const context: Context = {
        assets,
        assetsByLocation,
        assetsByStation,
    };

    return (
        <AssetContext.Provider value={context}>
            {children}
        </AssetContext.Provider>
    )
});
export type {
    AssetsByStation,
}
export {
    AssetProvider,
    useAssetContext,
}
