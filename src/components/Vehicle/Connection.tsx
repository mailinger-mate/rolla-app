import React from 'react';
import { IonButton, IonInput, IonItem, IonLabel, IonList, IonNote } from '@ionic/react';
import { BleClient, BleDevice, textToDataView } from '@capacitor-community/bluetooth-le';
import * as OTPAuth from 'otpauth';
import { useFirebaseContext } from '../../contexts/Firebase';
import { getVehicleSecurity } from '../../utils/db/security';
import { getDoc } from 'firebase/firestore';

const serviceUuid = '5afe1eaf-f000-4ecb-ab75-f9ec2e1f1f10';
const lockUuid = '0be70cad-92aa-48c3-b26a-330e339aa163';
const otpUuid = 'e313b008-9fb4-4f5e-95a7-3dc5ee030543';
const nonceUuid = 'b0446719-6abf-4eac-8f15-9f94062b0763';

const VehicleConnection = React.memo(() => {
    const { db } = useFirebaseContext();

    const [connectedDevice, setConnectedDevice] = React.useState<BleDevice>();
    const [isLockOpen, setLockOpen] = React.useState(false);
    const [counter, setNonce] = React.useState<number>();
    const [id, setId] = React.useState<string>();
    const [otp, setOtp] = React.useState<string>();
    const [adminKey, setAdminKey] = React.useState<string>();
    const [error, setError] = React.useState<string>();

    const readNonce = (dataView: DataView) => {
        setNonce(dataView.getUint32(0, true));
    }

    const readLock = (dataView: DataView) => {
        setLockOpen(Boolean(dataView.getUint8(0)));
    }

    const connect = React.useCallback(async () => {
        try {
            if (connectedDevice) {
                BleClient.disconnect(connectedDevice.deviceId);
                return;
            }

            await BleClient.initialize();

            const device = await BleClient.requestDevice({
                services: [serviceUuid],
                // name: id,
            });

            if (!device.name) return;

            await BleClient.connect(
                device.deviceId,
                disconnect,
            );

            readLock(await BleClient.read(device.deviceId, serviceUuid, lockUuid));
            readNonce(await BleClient.read(device.deviceId, serviceUuid, nonceUuid));

            await BleClient.startNotifications(
                device.deviceId,
                serviceUuid,
                nonceUuid,
                readNonce,
            );

            await BleClient.startNotifications(
                device.deviceId,
                serviceUuid,
                lockUuid,
                readLock,
            );

            // // disconnect after 10 sec
            // setTimeout(async () => {
            //     await BleClient.stopNotifications(device.deviceId, HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT_CHARACTERISTIC);
            //     await BleClient.disconnect(device.deviceId);
            //     console.log('disconnected from device', device);
            // }, 10000);
            
            setConnectedDevice(device);
            setId(device.name);
        } catch (e: any) {
            setError(e.message);
            console.log(e);
        }
    }, [connectedDevice]);

    const disconnect = () => {
        setConnectedDevice(undefined);
    };

    const lock = React.useCallback(() => {
        if (!connectedDevice?.name) return;

        const key = adminKey
            ? Promise.resolve(adminKey)
            : getVehicleSecurity(db, connectedDevice.name).then(access => {
                const { accessKey } = access.data()!;
                return accessKey;
            });

        return key.then(key => {
            const secret = OTPAuth.Secret.fromUTF8(key);
            const hotp = new OTPAuth.HOTP({ secret }).generate({ counter });
            setOtp(hotp);
            // setTimeout(() => setOtp(undefined), 2000);
            return BleClient.write(connectedDevice.deviceId, serviceUuid, otpUuid, textToDataView(hotp));
        });
    }, [connectedDevice, counter, adminKey]);

    return (
        <IonList>
            <IonItem>
                <IonLabel position="floating">Vehicle Code</IonLabel>
                <IonInput
                    type="text"
                    required={true}
                    value={id}
                    onIonChange={e => setId(e.detail.value!)}
                />
            </IonItem>
            <IonItem>
                <IonLabel position="floating">Admin Key</IonLabel>
                <IonInput
                    value={adminKey}
                    onIonChange={e => setAdminKey(e.detail.value!)}
                />
            </IonItem>
            <IonItem>
                <IonLabel position="floating">Nonce</IonLabel>
                <IonInput
                    type="number"
                    readonly={true}
                    value={counter}
                />
            </IonItem>
            <IonItem>
                <IonLabel position="floating">OTP</IonLabel>
                <IonInput
                    type="number"
                    value={otp}
                    maxlength={4}
                />
            </IonItem>
            {connectedDevice && <IonButton
                color={isLockOpen ? 'success' : 'warning'}
                expand="full"
                onClick={lock}
            >
                {isLockOpen ? 'Lock' : 'Unlock'}
            </IonButton>}
            <IonButton
                color={connectedDevice ? 'medium' : 'dark'}
                expand="full"
                onClick={connect}
            >
                {connectedDevice ? 'Disconnect' : 'Connect'}
            </IonButton>
        </IonList>
    )
});

VehicleConnection.displayName = 'VehicleConnection';

export {
    VehicleConnection
};