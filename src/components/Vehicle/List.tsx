import React from 'react';
import { IonButton, IonIcon, IonItem, IonItemDivider, IonItemSliding, IonLabel, IonList, IonListHeader, useIonLoading } from '@ionic/react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { addOutline, cloudDone, cloudOfflineOutline, starOutline } from 'ionicons/icons';
import { getAssets } from '../../utils/db/asset';

interface Props {
    station?: string;
    routerLink: string;
}

const VehicleList = React.memo<Props>(({
    routerLink,
    station,
}) => {
    const { db } = useFirebaseContext();
    const [value, loading, error] = useCollection(getAssets(db, station));
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    const remove = (id: string) => {
        // deleteStation(db, id);
    };

    const list = React.useMemo(() => {
        if (!value) return null;
        const items: React.ReactElement[] = [];
        const initials: string[] = [];

        value.docs.forEach((vehicle) => {
            const id = vehicle.id;
            const { name, isOnline } = vehicle.data();
            const initial = name[0];

            if (initials.indexOf(initial) < 0) {
                initials.push(initial);
                items.push((
                    <IonItemDivider key={initial} color="light">
                        <IonLabel className="ion-text-uppercase">{initial}</IonLabel>
                    </IonItemDivider>
                ));
            }

            items.push((
                <IonItemSliding
                    key={id}
                >
                    <IonItem
                        routerLink={`${routerLink}/${id}`}
                        detail={true}
                    >
                        <IonIcon
                            icon={isOnline ? cloudDone : cloudOfflineOutline}
                            slot="end"
                            size="small"
                            color="danger"
                        />
                        <IonLabel>
                            <h3>{name}</h3>
                            <p>{id}</p>
                        </IonLabel>
                    </IonItem>
                </IonItemSliding>
            ));
        });

        return items;
    }, [value]);

    return (
        <IonList>
            {list}
            {error?.message}
        </IonList>
    )
});

export default VehicleList;
