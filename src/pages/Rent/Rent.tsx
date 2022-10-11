import { IonContent, IonHeader, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import StationMap from '../../components/Station/Map';

const RentPage: React.FC<RouteComponentProps> = ({ match }) => {
    return (
        <IonPage>
            {/* <IonHeader>
                <IonToolbar>
                    <IonTitle>Rent</IonTitle>
                </IonToolbar>
            </IonHeader> */}
            <IonContent fullscreen scrollY={false}>
                {/* <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Host</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
                {/* <IonList>

                </IonList> */}
                <StationMap />
            </IonContent>
        </IonPage>
    );
};

export default RentPage;
