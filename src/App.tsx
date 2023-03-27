import React from 'react';
// import dotenv from 'dotenv';
import { Redirect, Route } from 'react-router-dom';
import {
    IonApp,
    IonBadge,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
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
import { person, flag, key, bicycleOutline, storefrontOutline, timeOutline, helpBuoy, helpBuoyOutline, helpCircleOutline, flagOutline, personOutline, mapOutline, exitOutline, enterOutline } from 'ionicons/icons';

import AuthenticationProvider, { useAuthenticationContext } from './contexts/Authentication';
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
import GoogleMapsProvider from './contexts/GoogleMap';
import HostRoute from './pages/Host/Router';
import RentRoute from './pages/Rent/Router';
import { StationProvider } from './contexts/Station';
import { Path } from './pages/path';
import { LocationProvider } from './contexts/Location';
import { AssetProvider } from './contexts/Asset';
import { AgentProvider } from './contexts/Agent';
import ContractProvider from './contexts/Contract';
import { StorageProvider } from './contexts/Storage';
import ThemeProvider from './contexts/Theme';

// dotenv.config();

setupIonicReact({
    scrollAssist: false,
});

const App = React.memo(() => {
    const { signIn, signOut, user } = useAuthenticationContext();
    return (
        <IonApp>
            <IonReactRouter>
                <IonSplitPane contentId="main" when={false}>
                    <IonMenu contentId="main">
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>User Menu</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent fullscreen={true}>
                            <IonList className="ion-margin-bottom">
                                <IonListHeader>Account</IonListHeader>
                                {user && <IonMenuToggle>
                                    <IonItem onClick={signOut} button={true} lines="none">
                                        <IonIcon icon={personOutline} slot="start" />
                                        <IonLabel>{user.email}</IonLabel>
                                        {/* <IonNote>Sign in</IonNote> */}
                                    </IonItem>
                                </IonMenuToggle>}
                                <IonMenuToggle>
                                    <IonItem onClick={user ? signOut : signIn} button={true} lines="none">
                                        <IonIcon icon={user ? exitOutline : enterOutline} slot="start" />
                                        <IonLabel>Sign {user ? 'Out' : 'In'}</IonLabel>
                                    </IonItem>
                                </IonMenuToggle>
                            </IonList>
                            <IonList>
                                <IonMenuToggle>
                                    <IonItem routerLink='/rent/map' button={true}>
                                        <IonIcon icon={mapOutline} slot="start" />
                                        <IonLabel>Map</IonLabel>
                                    </IonItem>
                                </IonMenuToggle>
                                <IonMenuToggle>
                                    <IonItem routerLink='/rent/activity' button={true}>
                                        <IonIcon icon={timeOutline} slot="start" />
                                        <IonLabel>Activity</IonLabel>
                                        <IonBadge slot="end" color="primary">1</IonBadge>
                                    </IonItem>
                                </IonMenuToggle>
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
});

const AppWithContext = React.memo(() => {
    return (
        <FirebaseProvider>
            <LocationProvider>
                <GoogleMapsProvider>
                    <AuthenticationProvider>
                        <ContractProvider>
                            {/* <StationProvider> */}
                                <AssetProvider>
                                    <StorageProvider>
                                        <AgentProvider>
                                            <ThemeProvider>
                                                <App />
                                            </ThemeProvider>
                                        </AgentProvider>
                                    </StorageProvider>
                                </AssetProvider>
                            {/* </StationProvider> */}
                        </ContractProvider>
                    </AuthenticationProvider>
                </GoogleMapsProvider>
            </LocationProvider>
        </FirebaseProvider>
    );
});

export default AppWithContext;
