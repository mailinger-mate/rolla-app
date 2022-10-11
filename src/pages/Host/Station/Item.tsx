import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import StationEdit from '../../../components/Station/Edit';
import VehicleList from '../../../components/Vehicle/List';
import { Path } from '../../path';

type Props = RouteComponentProps<{
    id: string;
}>

const Edit: React.FC<Props> = ({ match }) => {
    const station = match.params.id;
        return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>{station ? 'Edit' : 'New'} Station</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {/* <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Station</IonTitle>
                    </IonToolbar>
                </IonHeader> */}
                <StationEdit id={station} />

                <VehicleList station={station} />
            </IonContent>
        </IonPage>
    );
};

export default Edit;
