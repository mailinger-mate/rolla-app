import React from 'react';
import { IonIcon, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, useIonLoading } from '@ionic/react';
import { cloudOfflineOutline, flashOffOutline } from 'ionicons/icons';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { deleteStation, getStations } from '../../utils/db/station';

interface Props {
    routerLink: string;
}

const StationList: React.FC<Props> = (props) => {
    const { routerLink } = props;
    const { db } = useFirebaseContext();
    const [value, loading, error] = useCollection(getStations(db));
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    const remove = (id: string) => {
        deleteStation(db, id);
    };

    const list = React.useMemo(() => {
        if (!value) return null;
        const items: React.ReactElement[] = [];
        const initials: string[] = [];

        value.docs.forEach((station) => {
            const { name, address } = station.data();
            const initial = name[0];

            if (initials.indexOf(initial) < 0) {
                initials.push(initial);
                items.push((
                    <IonItemDivider key={initial}>
                        <IonLabel className="ion-text-uppercase">{initial}</IonLabel>
                    </IonItemDivider>
                ));
            }

            items.push((
                <IonItemSliding
                    key={station.id}
                >
                    <IonItem
                        routerLink={`${routerLink}/${station.id}`}
                        detail={true}
                    >
                        <IonIcon icon={flashOffOutline} size="small" slot="end"></IonIcon>
                        <IonIcon icon={cloudOfflineOutline} size="small" slot="end"></IonIcon>
                        <IonLabel>
                            <h2>{name}</h2>
                            <p>{address}</p>
                        </IonLabel>
                    </IonItem>
                    <IonItemOptions>
                        <IonItemOption
                            color="danger"
                            onClick={() => remove(station.id)}
                        >
                            Delete
                        </IonItemOption>
                    </IonItemOptions>
                </IonItemSliding>
            ));
        });
        return items;
    }, [value, loading]);

    return (
        <IonList>
            {list}
        </IonList>
    )
}

export default StationList;
