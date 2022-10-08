import React from 'react';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { addOutline, cloudDone, cloudOfflineOutline, starOutline } from 'ionicons/icons';
import { getVehicles } from '../../utils/db/vehicle';

interface Props {
    station?: string;
}

const VehicleList = React.memo<Props>(({
    station,
}) => {
    const { db } = useFirebaseContext();
    const [value, loading, error] = useCollection(getVehicles(db, { station }));

    return (
        <IonList>
            <IonListHeader>
                <IonLabel><h2>Vehicles</h2></IonLabel>
                <IonButton>
                    <IonIcon icon={addOutline} slot="icon-only" />
                </IonButton>
            </IonListHeader>
            {value && value.docs.map(vehicle => {
                const { isOnline, name } = vehicle.data();
                return (
                    <IonItem detail={true} key={vehicle.id} button={true}>
                        <IonIcon icon={isOnline ? cloudDone : cloudOfflineOutline} slot="start" />
                        <IonLabel>
                            <h3>{vehicle.id}</h3>
                            <p>{name}</p>
                        </IonLabel>
                    </IonItem>
                );
            })}
        </IonList>
    )
});

export default VehicleList;
