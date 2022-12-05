import React from 'react';
import { IonIcon, IonItem, IonItemDivider, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonSearchbar, useIonLoading } from '@ionic/react';
import { cloudOfflineOutline, flashOffOutline } from 'ionicons/icons';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { deleteStation, getStations, Station } from '../../utils/db/station';
import { DocumentSnapshot } from 'firebase/firestore';

interface Props {
    search?: boolean;
    routerLink?: string;
    onSelect?: (document: DocumentSnapshot<Station>) => void;
}

const StationList = React.memo<Props>(({
    search,
    onSelect,
    routerLink,
}) => {
    const { db } = useFirebaseContext();
    const [query, loading, error] = useCollection(getStations(db));
    const [present, dismiss] = useIonLoading();
    const [term, setTerm] = React.useState<string>();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    const remove = (id: string) => {
        deleteStation(db, id);
    };

    const list = React.useMemo(() => {
        if (!query) return null;
        const items: React.ReactElement[] = [];
        const initials: string[] = [];

        query.docs.forEach((document) => {
            const { name, address } = document.data();
            if (term) {
                const isMatch = name.toLowerCase().includes(term) || address.toLowerCase().includes(term);
                if (!isMatch) return;
            }

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
                    key={document.id}
                >
                    <IonItem
                        routerLink={routerLink && `${routerLink}/${document.id}`}
                        onSelect={onSelect ? () => onSelect(document) : undefined}
                        detail={routerLink ? true : false}
                    >
                        <IonIcon icon={flashOffOutline} size="small" slot="end"></IonIcon>
                        <IonIcon icon={cloudOfflineOutline} size="small" slot="end"></IonIcon>
                        <IonLabel>
                            <h2>{name}</h2>
                            <p>{address}</p>
                        </IonLabel>
                    </IonItem>
                    {!onSelect && <IonItemOptions>
                        <IonItemOption
                            color="danger"
                            onSelect={() => remove(document.id)}
                        >
                            Delete
                        </IonItemOption>
                    </IonItemOptions>}
                </IonItemSliding>
            ));
        });
        return items;
    }, [query, loading, term]);

    const searchTerm = (event: Event) => {
        const target = event.target as HTMLIonSearchbarElement;
        if (target) setTerm(target.value?.toLowerCase());
    };

    const clearTerm = () => setTerm(undefined);

    const searchbar = React.useMemo(() => {
        if (!search) return null;
        return (
            <IonSearchbar
                debounce={1000}
                placeholder="Search"
                showClearButton="always"
                // onSelect={() => modal.current?.setCurrentBreakpoint(1)}
                onIonChange={searchTerm}
                onIonClear={clearTerm}
            />
        )
    }, [search])

    return (
        <>
            {searchbar}
            <IonList>
                {list}
            </IonList>
        </>
    )
});

export default StationList;
