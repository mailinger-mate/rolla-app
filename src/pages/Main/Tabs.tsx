import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react"
import { bicycleOutline } from "ionicons/icons"
import { Redirect, Route } from "react-router"
import Tab1 from "../Tab1"
import Tab2 from "../Tab2"

const MainTabs: React.FC = () => {
    return (
        <IonTabs>
            <IonRouterOutlet id="main">
                <Route exact path="/ride" component={Tab1} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="ride" href="/ride">
                    <IonIcon icon={bicycleOutline} />
                    <IonLabel>Ride</IonLabel>
                </IonTabButton>
                {/* <IonTabButton tab="user" href="/user">
                    <IonIcon icon={person} />
                    <IonLabel>Account</IonLabel>
                </IonTabButton>
                <IonTabButton tab="lease" href="/lease/station/natureHome">
                    <IonIcon icon={key} />
                    <IonLabel>Lease</IonLabel>
                </IonTabButton> */}
            </IonTabBar>
        </IonTabs>
    )
}