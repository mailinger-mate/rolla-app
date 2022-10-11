import React from 'react';
// import dotenv from 'dotenv';
import { Redirect, Route } from 'react-router-dom';
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { person, flag, key, bicycleOutline } from 'ionicons/icons';

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

// dotenv.config();

setupIonicReact({
    scrollAssist: false,
});

const App: React.FC = () => (
    <FirebaseProvider>
        <GoogleMapProvider>
            <AuthenticationProvider>
                <IonApp>
                    <IonReactRouter>
                        <IonSplitPane contentId="main">
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
            </AuthenticationProvider>
        </GoogleMapProvider>
    </FirebaseProvider>
);

export default App;
