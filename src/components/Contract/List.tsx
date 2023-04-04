import { IonDatetime, IonInput, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import React from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useContractContext } from '../../contexts/Contract';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useAssetContext } from '../../contexts/Asset';
import { getContracts } from '../../utils/db/contract';

const ContractList = React.memo(() => {
    // const { db } = useFirebaseContext();
    // const [contracts, loading, error] = useCollection(getContracts(db));
    const { assets: vehicles } = useAssetContext();
    const { contracts } = useContractContext();

    const list = React.useMemo(() => {
        if (!contracts) return;
        const list = [];
        for (const id in contracts) {
            const { end, asset } = contracts[id];
            // const vehicle = vehicles[asset.id] || {};
            // if (!vehicle) continue;
            list.push((
                <IonItem key={id}>
                    <IonLabel>
                        {asset.id}
                        {/* <p>{vehicle.model}</p> */}
                    </IonLabel>
                    <IonLabel slot="end">
                        {end.toDate().toLocaleDateString()}
                    </IonLabel>
                </IonItem>
            ))
        }
        return list;
    }, [contracts, vehicles]);

    return (
        <IonList>
            <IonListHeader>Active</IonListHeader>
            {list}
        </IonList>
    )
});

export { ContractList };
