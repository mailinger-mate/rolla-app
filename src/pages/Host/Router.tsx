import { IonRouterOutlet } from '@ionic/react';
import { Route, RouteComponentProps } from 'react-router';
import StationItemPage from './Station/Item';
import Host from './Host';
import { Action, Path } from '../path';
import StationListPage from './Station/List';
import VehicleItemPage from './Vehicle/Item';
import VehicleListPage from './Vehicle/List';

const HostRoute: React.FC<RouteComponentProps> = ({ match }) => {
    const station = match.url + '/' + Path.station;
    const vehicle = match.url + '/' + Path.vehicle;
    return (
        // <IonPage>
            <IonRouterOutlet>
                <Route path={match.url} exact component={Host} />
    
                <Route path={station} exact component={StationListPage} />
                <Route path={station + '/:id'} component={StationItemPage} />
                <Route path={station + '/' + Action.new} exact component={StationItemPage} />
        
                <Route path={vehicle} exact component={VehicleListPage} />
                <Route path={vehicle + '/:id'} component={VehicleItemPage} />
                <Route path={vehicle + '/' + Action.new} exact component={VehicleItemPage} />
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
