import React from 'react';
import { IonFabButton, IonIcon, IonSpinner, useIonLoading, useIonToast } from '@ionic/react';
import { keyOutline, lockClosedOutline, lockOpenOutline } from 'ionicons/icons';
import { useAgentContext } from '../../contexts/Agent';

interface Props {
    name?: string;
}

const VehicleConnectButton = React.memo<Props>(() => {
    const { agent, isLockOpen, target, select, open } = useAgentContext();

    const { color, icon } = React.useMemo(() => {
        const color = agent
            ? isLockOpen
                ? 'warning'
                : 'success'
            : 'medium';
        const icon = agent
            ? isLockOpen
                ? lockOpenOutline
                : lockClosedOutline
            : keyOutline;
        return { color, icon };
    }, [agent, isLockOpen]);

    return (
        <>
            {agent && (
                <IonFabButton
                    color="medium"
                    size="small"
                    onClick={open}
                >
                    <IonIcon icon={keyOutline} />
                </IonFabButton>
            )}
            <IonFabButton
                color={color}
                disabled={!!target}
                size="small"
                onClick={() => !target && select()}
            >
                {target
                    ? <IonSpinner name="crescent" />
                    : <IonIcon icon={icon} />}
            </IonFabButton>
        </>
    )
});

export { VehicleConnectButton };