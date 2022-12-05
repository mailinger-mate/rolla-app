import React from 'react';
// import dotenv from 'dotenv';
import { Redirect, Route } from 'react-router-dom';
import {
    IonApp,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonNote,
    IonRouterOutlet,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonTitle,
    IonToolbar,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { person, flag, key, bicycleOutline, storefrontOutline, timeOutline, helpBuoy, helpBuoyOutline, helpCircleOutline, flagOutline, personOutline } from 'ionicons/icons';

import AuthenticationProvider from './contexts/Authentication';
import FirebaseProvider from './contexts/Firebase';

import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Lease from './pages/Lease';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import GoogleMapProvider from './contexts/GoogleMap';
import HostRoute from './pages/Host/Router';
import RentRoute from './pages/Rent/Router';
import { StationProvider } from './contexts/Station';
import { Path } from './pages/path';
import { LocationProvider } from './contexts/Location';
import { VehicleProvider } from './contexts/Vehicle';

// dotenv.config();

setupIonicReact({
    scrollAssist: false,
});

const App = React.memo(() => {
    const app = (
        <IonApp>
            <IonReactRouter>
                <IonSplitPane contentId="main">
                    <IonMenu contentId="main" hidden={true}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>User Menu</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent fullscreen={true}>
                            <IonList className="ion-margin-bottom">
                                <IonItem lines="none">
                                    <IonIcon icon={personOutline} slot="start" />
                                    <IonLabel>Account</IonLabel>
                                    <IonNote>Sign in</IonNote>
                                </IonItem>
                            </IonList>
                            <IonList>
                                <IonItem>
                                    <IonIcon icon={timeOutline} slot="start" />
                                    <IonLabel>History</IonLabel>
                                </IonItem>
                                <IonItem>
                                    <IonIcon icon={helpCircleOutline} slot="start" />
                                    <IonLabel>Help</IonLabel>
                                </IonItem>
                            </IonList>
                        </IonContent>
                        <IonFooter className='ion-margin-bottom'>

                            <IonList>
                                <IonItem routerLink={`/${Path.host}`} lines="none" >
                                    <IonIcon icon={flagOutline} slot="start" />
                                    <IonLabel>Host</IonLabel>
                                </IonItem>
                            </IonList>
                        </IonFooter>
                    </IonMenu>
                    <IonRouterOutlet id="main">
                        <Route exact path="/">
                            <Redirect to="/rent" />
                        </Route>
                        <Route path="/host" component={HostRoute} />
                        <Route path="/rent" component={RentRoute} />
                    </IonRouterOutlet>
                </IonSplitPane>
            </IonReactRouter>
        </IonApp>
    );

    return (
        <FirebaseProvider>
            <LocationProvider>
                <GoogleMapProvider>
                    <AuthenticationProvider>
                        <StationProvider>
                            <VehicleProvider>
                                {app}
                            </VehicleProvider>
                        </StationProvider>
                    </AuthenticationProvider>
                </GoogleMapProvider>
            </LocationProvider>
        </FirebaseProvider>
    );
});

export default App;
