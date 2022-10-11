import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonRouterLink, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { bagOutline, buildOutline, cartOutline, checkmarkOutline, cloudOutline, moonOutline, powerOutline, sunnyOutline, wifiOutline } from 'ionicons/icons';
import { Controller, useForm } from 'react-hook-form';

type Form = {
    wifiName: string;
    wifiKey: string;
    adminKey: string;
    mqttUrl?: string;
    mqttTopic?: string;
    libUrl?: string;
}

const AddSecurity = React.memo(() => {
    const { handleSubmit, control } = useForm<Form>({
        defaultValues: {
            mqttUrl: 'test.mosquitto.org',
            mqttTopic: 'rolla/pulse',
            // wifiName: 'test',
            libUrl: 'http://rolla.sgp1.cdn.digitaloceanspaces.com/rollo-esp32-ino.bin',
        }
    });

    const modal = React.useRef<HTMLIonModalElement>(null);

    return (
        <>
            <IonList>
                <IonListHeader>
                    <IonLabel>Connectivity</IonLabel>
                </IonListHeader>

                <IonItem lines="none">
                    <IonLabel className="ion-text-wrap">
                        You can connect the vehicle to the online fleet
                        with a easy to install smart ignition lock
                        so people can rent it via the platform and unlock
                        it without a physical key only using their smartphone.
                    </IonLabel>
                </IonItem>
                <IonItem detail>
                    <IonIcon icon={cartOutline} slot="start" />
                    <IonLabel color="primary">
                        Order Smart Lock
                    </IonLabel>
                </IonItem>
                <IonItem detail>
                    <IonIcon icon={buildOutline} slot="start" />
                    <IonLabel color="primary">
                        Install hardware
                    </IonLabel>
                </IonItem>
                <IonItem id="connect" button detail>
                    <IonIcon icon={cloudOutline} slot="start" />
                    <IonLabel color="primary">
                        Connect
                    </IonLabel>
                </IonItem>
            </IonList>

            <IonModal ref={modal} trigger="connect">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                        </IonButtons>
                        <IonTitle>Connect Vehicle</IonTitle>
                        {/* <IonButtons slot="end">
                            <IonButton strong={true}>
                                Confirm
                            </IonButton>
                        </IonButtons> */}
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <IonList>
                        <IonListHeader>
                            <IonLabel>
                                Discovery
                            </IonLabel>
                        </IonListHeader>

                        <IonItem lines="none">
                            <IonLabel className="ion-text-wrap">
                                You need to follow the steps below
                                to succesfully connect the vehicle.
                            </IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                            <IonIcon icon={powerOutline} slot="start" />
                            <IonLabel>
                                Powering on
                            </IonLabel>
                            <IonIcon icon={checkmarkOutline} slot="end" size="small" />
                            <IonNote slot="helper">
                                <IonRouterLink>After installing the hardware </IonRouterLink>
                                you also need to verify the device
                                is powered by turning on the onboard switch
                                and confirming for the power light is blinking.
                            </IonNote>
                        </IonItem>
                        <IonItem lines="none">
                            <IonIcon icon={sunnyOutline} slot="start" />
                            <IonLabel>
                                Waking up
                            </IonLabel>
                            <IonIcon icon={checkmarkOutline} slot="end" size="small" />
                            {/* <IonSpinner slot="end" name="crescent" /> */}
                            <IonNote slot="helper">
                                You need to create some motion to the vehicle
                                so it wakes up from battery saving mode and
                                enables connectivity.
                            </IonNote>
                        </IonItem>
                        <IonItem lines="none">
                            <IonIcon icon={wifiOutline} slot="start" />
                            <IonLabel>
                                Connecting
                            </IonLabel>
                            <IonSpinner slot="end" name="crescent" />
                            <IonNote slot="helper">
                                The app needs to connect to the smart lock
                                so you can configure its settings
                                privately.
                            </IonNote>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Password</IonLabel>
                            <IonInput
                                type="password"
                            />
                            <IonNote slot="helper">
                                <IonRouterLink>After a hardware reset </IonRouterLink>
                                you can also change a forgotten password but you need
                                to also reconnect the vehicle again.
                            </IonNote>
                        </IonItem>
                    </IonList>
                    <IonList className='ion-padding-top'>

                        <IonItemDivider>
                            <IonLabel>WiFi</IonLabel>
                        </IonItemDivider>
                        <IonItem>
                            <IonLabel>Name</IonLabel>
                            <Controller
                                name="wifiName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        // slot="end"
                                        placeholder="Station WiFi"
                                        {...field}
                                    />}
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel>Password</IonLabel>
                            <Controller
                                name="wifiKey"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        // slot="end"
                                        type="password"
                                        {...field}
                                    />}
                            />
                        </IonItem>

                        <IonItemDivider>
                            <IonLabel>MQTT</IonLabel>
                        </IonItemDivider>
                        <IonItem>
                            <IonLabel>Server</IonLabel>
                            <Controller
                                name="mqttUrl"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        // slot="end"
                                        type="url"
                                        {...field}
                                    />}
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel>Topic</IonLabel>
                            <Controller
                                name="mqttTopic"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        // slot="end"
                                        {...field}
                                    />}
                            />
                        </IonItem>

                        <IonItemDivider>
                            <IonLabel color="medium" className="">Firmware</IonLabel>
                        </IonItemDivider>
                        <IonItem>
                            <IonLabel>Server</IonLabel>
                            <Controller
                                name="libUrl"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        // slot="end"
                                        type="url"
                                        {...field}
                                    />}
                            />
                        </IonItem>
                        {/* <IonItemDivider className="ion-margin-top">
                            <IonLabel>Security</IonLabel>
                        </IonItemDivider>
                        <IonItem>
                            <IonLabel>Password</IonLabel>
                            <Controller
                                name="adminKey"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) =>
                                    <IonInput
                                        slot="end"
                                        type="password"
                                        {...field}
                                    />}
                            />
                        </IonItem> */}
                    </IonList>
                </IonContent>
            </IonModal>
        </>
    );
});

export default AddSecurity;