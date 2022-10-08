import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import StationList from '../../../components/Station/List';
import { Action, Path } from '../../path';

type Props = RouteComponentProps<{
    id: string;
}>

const List: React.FC<Props> = ({ match }) => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>Stations</IonTitle>
                    <IonButtons slot="end">
                        <IonButton routerLink={`${match.url}/${Action.new}`}>
                            <IonIcon slot="icon-only" icon={add} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <StationList routerLink={match.url} />
                {/* <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton />
                        </IonButtons>
                        <IonTitle size="large">Stations</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
                {/* <StationEdit id={station} /> */}
            </IonContent>
        </IonPage>
    );
};

export default List;
