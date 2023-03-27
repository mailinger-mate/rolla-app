import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonSpinner } from '@ionic/react';
import { bluetooth, globe, key, lockClosed, lockOpen, moon } from 'ionicons/icons';
import React from 'react';
import { Asset } from '../../utils/db/asset';


interface Props {
    id: string,
    isConnected?: boolean;
    isLeased?: boolean,
    isOnline?: boolean,
    isUnlocked?: boolean;
    isTarget?: boolean;
    select?: () => void;
    disconnect?: () => void;
    vehicle: Asset,
}

const VehicleListItem = React.memo<Props>(({
    id,
    isConnected,
    isLeased,
    isOnline,
    isUnlocked,
    isTarget,
    select,
    disconnect,
    vehicle,
}) => {
    const { name, model, free } = vehicle;
    const item = (
        <IonItem
            onClick={select}
        >
            <IonLabel>
                {name}
                <p>{model}</p>
            </IonLabel>
            {isTarget && (
                <IonSpinner
                    name="lines-sharp-small"
                    slot="end"
                />
            )}
            {isConnected && !isTarget && (isUnlocked === true || isUnlocked === false) && (
                <IonIcon
                    icon={isUnlocked ? lockOpen : lockClosed}
                    color={isUnlocked ? 'warning' : 'success'}
                    size="small"
                    slot="end"
                />
            )}
            {isLeased && !isConnected && (
                <IonIcon
                    icon={key}
                    // color="medium"
                    size="small"
                    slot="end"
                />
            )}
            {free && (
                <IonIcon
                    icon={globe}
                    color="medium"
                    size="small"
                    slot="end"
                />
            )}
            <IonIcon
                icon={isConnected || isOnline ? bluetooth : moon}
                // color="medium"
                color={isConnected ? 'success' : 'medium'}
                size="small"
                slot="end"
            />
        </IonItem>
    );
    if (isConnected) {
        return (
            <IonItemSliding>
                {item}
                <IonItemOptions>
                    {/* {assetsLeased.length > 1 && <IonItemOption>Save</IonItemOption>} */}
                    <IonItemOption
                        color="medium"
                        onClick={disconnect}
                    >
                        Disconnect
                    </IonItemOption>
                </IonItemOptions>
            </IonItemSliding>
        );
    }
    return item;
});

VehicleListItem.displayName = 'VehicleListItem';

export {
    VehicleListItem,
};
