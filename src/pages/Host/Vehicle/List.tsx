import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import VehicleList from '../../../components/Vehicle/List';
import { Action, Path } from '../../path';

type Props = RouteComponentProps<{
    id: string;
}>

const VehicleListPage: React.FC<Props> = ({ match }) => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>Vehicles</IonTitle>
                    <IonButtons slot="end">
                        <IonButton routerLink={`${match.url}/${Action.new}`}>
                            <IonIcon slot="icon-only" icon={add} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <VehicleList routerLink={match.url} />
            </IonContent>
        </IonPage>
    );
};

export default VehicleListPage;
