import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { Path } from '../path';
import { ActivityPage } from './Activity';
import MapPage from './Map';

const RentRoute: React.FC<RouteComponentProps> = ({ match }) => {
    const mapPath = match.url + '/' + Path.map;
    const activityPath = match.url + '/' + Path.acitvity;
    // const vehicle = match.url + '/' + Path.vehicle;
    return (
        // <IonPage>

        <IonRouterOutlet>
            <Route path={mapPath} exact component={MapPage} />
            <Route path={activityPath} component={ActivityPage} />
            <Route path={match.url} exact>
                <Redirect to={mapPath} />
            </Route>
        </IonRouterOutlet>
        // <IonTabs>

        //     <IonTabBar
        //         slot="bottom"
        //         translucent={true}
        //         style={{ position: 'absolute', bottom: '0', width: '100%' }}
        //     >
        //         <IonTabButton tab="map">
        //             <IonIcon icon={compass} />
        //             <IonLabel>Map</IonLabel>
        //         </IonTabButton>
        //         <IonTabButton tab="help">
        //             <IonIcon icon={book} />
        //             <IonLabel>Help</IonLabel>
        //         </IonTabButton>
        //     </IonTabBar>
        // </IonTabs>
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
