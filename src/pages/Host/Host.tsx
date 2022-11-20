import { IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonProgressBar, IonRouterLink, IonTitle, IonToolbar } from '@ionic/react';
import { alertCircleOutline, bicycleOutline, cloudOfflineOutline, globeOutline, keyOutline, peopleOutline, starHalf, storefrontOutline, walletOutline } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { Path } from '../path';

const Host: React.FC<RouteComponentProps> = ({ match }) => {
    const score = 0.6;
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Host</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Host</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonList>
                    <IonItem lines="none" detail>
                        <IonIcon icon={starHalf} slot="start" size="large"></IonIcon>
                        <IonLabel>
                            <h2>Advanced</h2>
                            <p>{Math.round(score * 100)}% complete</p>
                        </IonLabel>
                    </IonItem>
                    <IonProgressBar
                        type="determinate"
                        value={score}
                    />

                    <IonListHeader>
                        <IonLabel>Assets</IonLabel>
                    </IonListHeader>
                    <IonItem routerLink={`${match.url}/${Path.station}`} detail>
                        <IonIcon icon={storefrontOutline} slot="start"></IonIcon>
                        <IonNote slot="end">3</IonNote>
                        <IonLabel>Stations</IonLabel>
                    </IonItem>
                    <IonItem routerLink={`${match.url}/${Path.vehicle}`} detail>
                        <IonIcon icon={bicycleOutline} slot="start"></IonIcon>
                        <IonIcon icon={cloudOfflineOutline} slot="end" size="small" color="danger"></IonIcon>
                        <IonNote slot="end">12</IonNote>
                        <IonLabel>Vehicles</IonLabel>
                    </IonItem>
                    <IonListHeader>
                        <IonLabel>Services</IonLabel>
                    </IonListHeader>
                    <IonItem routerLink={`${match.url}/${Path.payment}`} detail>
                        <IonIcon icon={walletOutline} slot="start"></IonIcon>
                        <IonIcon icon={alertCircleOutline} slot="end" size="small" color="danger"></IonIcon>
                        <IonLabel>Payments</IonLabel>
                    </IonItem>
                    <IonItem detail routerLink={Path.vehicle}>
                        <IonIcon icon={keyOutline} slot="start"></IonIcon>
                        <IonNote slot="end">2</IonNote>
                        <IonLabel>Rentals</IonLabel>
                    </IonItem>
                    <IonListHeader>
                        <IonLabel>Access</IonLabel>
                    </IonListHeader>
                    <IonItem detail routerLink={Path.vehicle}>
                        <IonIcon icon={peopleOutline} slot="start"></IonIcon>
                        <IonNote slot="end">3</IonNote>
                        <IonLabel>Team</IonLabel>
                    </IonItem>
                    <IonItem detail routerLink={Path.vehicle}>
                        <IonIcon icon={globeOutline} slot="start"></IonIcon>
                        <IonNote slot="end">chula.ac.th</IonNote>
                        <IonLabel>Domain</IonLabel>
                    </IonItem>
                </IonList>
                {/* <IonRouterLink routerLink='/rent'>Rent</IonRouterLink> */}
            </IonContent>
        </IonPage >
    );
};

export default Host;
