import React from 'react';
import { IonDatetime, IonDatetimeButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonToggle, useIonLoading } from '@ionic/react';
import { input, toggle } from '../Form/control';
import { Controller, useForm } from 'react-hook-form';
import { useFirebaseContext } from '../../contexts/Firebase';
import { getSecurity, getVehicleSecurity, setSecurity } from '../../utils/db/security';
import { useDocument } from 'react-firebase-hooks/firestore';
import { closeOutline, powerOutline, refreshOutline, wifiOutline } from 'ionicons/icons';

interface Props {
    id: string;
}

type Form = {
    isEnabled: boolean;
}

const EditSecurity = React.memo<Props>(({
    id,
}) => {
    const { db } = useFirebaseContext();
    const [value, loading, error] = useDocument(getSecurity(db, id));
    const { handleSubmit, setValue, register, formState, control, watch } = useForm<Form>();
    const [present, dismiss] = useIonLoading();

    React.useEffect(() => {
        loading ? present() : dismiss();
    }, [loading]);

    React.useEffect(() => {
        if (!value) return;
        const { isEnabled } = value.data() || {};
        setValue('isEnabled', isEnabled || false);
    }, [value]);

    handleSubmit((form) => {
        console.log(form);
    });

    return (
        <IonList>
            <IonListHeader>
                <IonLabel>Connectivity</IonLabel>
            </IonListHeader>

            <IonItem>
                <IonLabel>Enable</IonLabel>
                <Controller
                    name="isEnabled"
                    control={control}
                    defaultValue={false}
                    rules={{ required: true }}
                    render={({ field: { value, ...rest } }) =>
                        <IonToggle
                            checked={value}
                            slot="end"
                            {...rest}
                        />}
                />
            </IonItem>
            <IonItem>
                <IonLabel>WiFi</IonLabel>
                <IonLabel slot="end" color="medium">Nature Home 2</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Battery</IonLabel>
                <IonLabel slot="end" color="medium">85%</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Pulse</IonLabel>
                <IonLabel slot="end" color="medium">14m ago</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Secret</IonLabel>
                <IonLabel slot="end" color="medium">4h ago</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Software</IonLabel>
                <IonLabel slot="end" color="medium">rola-1.7</IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel>Hardware</IonLabel>
                <IonLabel slot="end" color="medium">blygo-1.2</IonLabel>
            </IonItem>
            {/* <IonItem>
                <IonLabel>Last update</IonLabel>
                <IonDatetimeButton disabled datetime="lastUpdate" />
                <IonDatetime id="lastUpdate" hidden />
            </IonItem> */}
            {/* {input<Form>('WiFi Name', register('wifiName'))} */}
            
            <IonItem detail>
                <IonIcon icon={refreshOutline} slot="start" />
                <IonLabel color="primary">
                    Reconnect
                </IonLabel>
            </IonItem>
            <IonItem detail>
                <IonIcon icon={closeOutline} slot="start" />
                <IonLabel color="primary">
                    Disconnect
                </IonLabel>
            </IonItem>
        </IonList>
    )
});

export default EditSecurity;
