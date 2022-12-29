import React from 'react';
import { onSnapshot } from 'firebase/firestore';
import { Contract, getContracts } from '../utils/db/contract';
import { useFirebaseContext } from './Firebase';

type Contracts = Record<string, Contract>;

interface Context {
    contracts?: Contracts;
    assetsLeased?: string[];
    hasLease: (vehicleId: string) => boolean;
}

const ContractContext = React.createContext<Context>({
    hasLease: () => false,
});

export const useContractContext = () => React.useContext(ContractContext);

const ContractProvider = React.memo(({ children }) => {
    const { db } = useFirebaseContext();
    const [contracts, setContracts] = React.useState<Record<string, Contract>>();

    React.useEffect(() => {
        const unsubscribe = onSnapshot(getContracts(db, true), query => {
            setContracts(previousContracts => {
                const contracts = Object.assign({}, previousContracts);
                query.docChanges().forEach(({ type, doc }) => {
                    const id = doc.ref.id;
                    switch (type) {
                        case 'removed': {
                            delete contracts[id];
                            break;
                        }
                        default: {
                            contracts[id] = doc.data();
                        }
                    }
                });
                return contracts;
            })
        });

        return () => unsubscribe();
    }, [db]);

    const hasLease = React.useCallback((vehicleId: string) => {
        if (!contracts) return false;
        return Object.values(contracts).some(({ asset }) => {
            if (asset.id === vehicleId) return true;
        });
    }, [contracts])

    const assetsLeased = React.useMemo(() => {
        const list: string[] = [];
        for (const id in contracts) {
            const { asset } = contracts[id];
            if (list.indexOf(asset.id) < 0) list.push(asset.id);
        }
        if (!list.length) return;
        return list;
    }, [contracts])

    const context = React.useMemo<Context>(() => ({
        assetsLeased,
        contracts,
        hasLease,
    }), [contracts])

    return (
        <ContractContext.Provider value={context}>
            {children}
        </ContractContext.Provider>
    );

});

export default ContractProvider;
