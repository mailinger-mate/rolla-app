import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import VehicleConnection from '../components/Vehicle/Connection';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ride</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Ride</IonTitle>
          </IonToolbar>
        </IonHeader>
        <VehicleConnection />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
