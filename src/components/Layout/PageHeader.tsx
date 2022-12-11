import { IonButton, IonButtons, IonHeader, IonIcon, IonMenuToggle, IonTitle, IonToolbar } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import React from 'react';

interface Props {
    menuButton?: boolean;
    title?: string;
}

const PageHeader = React.memo<React.PropsWithChildren<Props>>(({
    children,
    menuButton,
    title,
}) => {
    return (
        <IonHeader
        // translucent={true}
        // style={{ position: 'absolute' }}
        >
            <IonToolbar>
                {menuButton && <IonButtons slot="start">
                    <IonMenuToggle>
                        <IonButton>
                            <IonIcon slot="icon-only" icon={personCircleOutline}/>
                        </IonButton>
                    </IonMenuToggle>
                </IonButtons>}
                {title && <IonTitle>{title}</IonTitle>}
                {children}
                {/* <IonSearchbar
                    placeholder="Rentals"
                    animated={true}
                    className="ion-no-padding"
                /> */}
            </IonToolbar>
        </IonHeader>
    );
});

export { PageHeader };
