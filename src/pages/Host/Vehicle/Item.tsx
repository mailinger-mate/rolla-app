import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import VehicleEdit from '../../../components/Vehicle/Edit';
import { Path } from '../../path';

type Props = RouteComponentProps<{
    id: string;
}>

const VehicleItemPage: React.FC<Props> = ({ match }) => {
    const vehicle = match.params.id;
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/${Path.host}`} />
                    </IonButtons>
                    <IonTitle>{vehicle ? 'Edit' : 'New'} Vehicle</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <VehicleEdit id={vehicle} />
            </IonContent>
        </IonPage>
    );
};

export default VehicleItemPage;
