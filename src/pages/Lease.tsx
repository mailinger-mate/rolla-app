import { IonContent, IonHeader, IonPage, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, RouteComponentProps } from 'react-router';
import Edit from './Host/Station/Item';
import './Tab3.css';

type HostPageProps = RouteComponentProps<{
  id: string;
}>

const Tab3: React.FC<HostPageProps> = ({ match }) => {
  const station = match.params.id;
  console.log('lease page');
  return (
    <IonPage>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* <Route exact path={match.url} component={StationEditPage} /> */}
          <Route path={`${match.url}/station/:id`} component={Edit} />
        </IonRouterOutlet>
      </IonReactRouter>
      <IonHeader>
        <IonToolbar>
          <IonTitle>LEASER</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Lease</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
