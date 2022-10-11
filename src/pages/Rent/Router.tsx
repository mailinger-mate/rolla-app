import { IonRouterOutlet } from '@ionic/react';
import { Route, RouteComponentProps } from 'react-router';
import { Action, Path } from '../path';
import RentPage from './Rent';

const RentRoute: React.FC<RouteComponentProps> = ({ match }) => {
    const station = match.url + '/' + Path.station;
    const vehicle = match.url + '/' + Path.vehicle;
    return (
        // <IonPage>
            <IonRouterOutlet>
                <Route path={match.url} exact component={RentPage} />

            </IonRouterOutlet>
            // {/* <IonHeader>
            //     <IonToolbar>
            //         <IonTitle>Host YOOO</IonTitle>
            //     </IonToolbar>
            // </IonHeader>
            // <IonContent fullscreen>
            //     <IonHeader collapse="condense">
            //         <IonToolbar>
            //             <IonTitle size="large">Host</IonTitle>
            //         </IonToolbar>
            //     </IonHeader>
            // </IonContent> */}
        // </IonPage>
    );
};

export default RentRoute;
