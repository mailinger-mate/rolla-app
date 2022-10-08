import { IonContent, IonHeader, IonPage, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/react';
import { Route, RouteComponentProps } from 'react-router';
import Edit from './Station/Edit';
import Host from './Host';
import { Action, Path } from '../path';
import List from './Station/List';

const HostRoute: React.FC<RouteComponentProps> = ({ match }) => {
    const station = match.url + '/' + Path.station;
    return (
        // <IonPage>
            <IonRouterOutlet>
                <Route path={match.url} exact component={Host} />
                <Route path={station} exact component={List} />
                <Route path={station + '/:id'} component={Edit} />
                <Route path={station + '/' + Action.new} exact component={Edit} />
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

export default HostRoute;
