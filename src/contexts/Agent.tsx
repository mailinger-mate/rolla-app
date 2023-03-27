import React from 'react';
import { BleClient, BleDevice, RequestBleDeviceOptions, ScanResult, textToDataView } from '@capacitor-community/bluetooth-le';
import * as OTPAuth from 'otpauth';
import { agentScan, agentScanInterval, agentSkill, agentSleepAfter, animationDelay, lockUuid, nonceUuid, otpUuid, serviceUuid, toastDuration } from '../config';
import { useFirebaseContext } from './Firebase';
import { Security } from '../utils/db/security';
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonModal, IonSpinner, useIonToast } from '@ionic/react';
import { bluetoothOutline, checkmarkOutline, key, lockClosedOutline, lockOpenOutline, mapOutline, moonOutline, radioOutline, sunnyOutline, warning } from 'ionicons/icons';
import { useContractContext } from './Contract';
import { PageHeader } from '../components/Layout/PageHeader';
import { useAssetContext } from './Asset';
import { Store, useStorageContext } from './Storage';
import { DocumentReference, onSnapshot } from 'firebase/firestore';
import { isAfter } from '../utils/datetime';
import { VehicleListItem } from '../components/Vehicle/ListItem';
import { getAssetsByAgent, Asset } from '../utils/db/asset';

interface Context {
    select: (name?: string) => Promise<void>;
    open: () => void;
    close: () => void;
    // toggle: (id?: string) => Promise<void>;
    isLockOpen?: boolean;
    agent?: string;
    target?: string;
}

const AgentContext = React.createContext<Context>({
    select: () => Promise.resolve(undefined),
    open: () => undefined,
    close: () => undefined,
});

const bleOptions = ({
    name,
}: RequestBleDeviceOptions = {}): RequestBleDeviceOptions => ({
    services: [serviceUuid],
    name,
})

export const useAgentContext = () => React.useContext(AgentContext);

const done = (
    <IonIcon
        icon={checkmarkOutline}
        color="success"
        slot="end"
        size="small"
    />
);
const progress = (
    <IonSpinner
        slot="end"
        name="lines-sharp-small"
    />
);

const generateOtp = (
    key: string,
    counter: number,
) => {
    const secret = OTPAuth.Secret.fromUTF8(key);
    const otp = new OTPAuth.HOTP({ secret }).generate({ counter });
    return otp;
}

enum Message {
    RideError = 'Ride Error',
    NoAccess = 'No access',
    NotFound = 'Not found',
    NotConnected = 'Not connected',
    NoLock = 'No lock access'
}

enum Breakpoint {
    Min = 0.5,
    Max = 0.9,
}

enum Key {
    AccessKey = 'accessKey',
    Agent = 'agent',
    Skill = 'agentSkill',
}

const error = (message: Message) => {
    return new Error(message);
}

const AgentProvider = React.memo((props) => {
    const { db } = useFirebaseContext();
    const storage = useStorageContext();
    const { assetsLeased } = useContractContext();
    // const { vehicles } = useVehicleContext();

    const [target, setTarget] = React.useState<'auto' | string>();
    const device = React.useRef<BleDevice>();
    // const [device, setDevice] = React.useState<BleDevice>();
    // const [isAwake, setAwake] = React.useState(false);

    const [isLockOpen, setLockOpen] = React.useState<boolean>();
    const [adminKey] = React.useState<string>();

    // const [nonce, setNonce] = React.useState<number>();

    const nonce = React.useRef<number>();

    const modalRef = React.useRef<HTMLIonModalElement>(null);

    const [isSelecting, setSelecting] = React.useState(false);
    
    // React.useEffect(() => {
    //     setTimeout(() => setSelecting(true), 1000);
    // }, []);

    const [presentToast] = useIonToast();

    const showError = React.useCallback(async (
        error: unknown,
    ) => {
        if (!(error instanceof Error)) return;
        await presentToast(
            Message.RideError + ': ' + error.message,
            toastDuration
        );
    }, [presentToast]);

    React.useEffect(() => {
        modalRef.current?.setCurrentBreakpoint(isSelecting ? Breakpoint.Max : Breakpoint.Min);
    }, [isSelecting])

    const [agents, setAgents] = React.useState<Store<ScanResult>[]>([]);
    const [isSkilled, setSkilled] = React.useState(false);

    const practiceSkill = React.useCallback(async (
        callback: () => void,
    ) => {
        const skill = await storage.get(Key.Skill) || 0;
        if (skill >= agentSkill) return setSkilled(true);
        await storage.set(Key.Skill, skill + 1);
        callback();
    }, [storage]);

    const readNonce = React.useCallback((dataView: DataView) => {
        const value = dataView.getUint32(0, true);
        // setNonce(value);
        nonce.current = value;
        // return value;
    }, [])

    const readLock = React.useCallback((dataView: DataView) => {
        const value = Boolean(dataView.getUint8(0));
        setLockOpen(value);
        return value;
    }, []);


    const [vehicles, setVehicles] = React.useState<Record<string, Asset>>();

    // React.useEffect(() => {
    //     if (!agents.length) return;
    //     getVehiclesByAgent(db, agents.map(({ value }) => value.device.deviceId))
    //         .then(query => {
    //             setVehicles(Object.fromEntries(
    //                 query.docs.map(document =>
    //                     [document.id, document.data()])));
    //         })
    // }, [
    //     agents
    // ]);

    const [agent, setAgent] = React.useState<string>();

    const [security, setSecurity] = React.useState<DocumentReference<Security>>();

    React.useEffect(() => {
        if (!agent || !vehicles) return;
        return setSecurity(previous => {
            const security = vehicles[agent].security;
            if (!previous || security.id !== previous.id) return security;
            return previous;
        });
    }, [vehicles, agent]);
    

    const accessKey = React.useRef<string>();

    React.useEffect(() => {
        if (!security || !agent) return;
        return onSnapshot(security, async document => {
            const data = document.data();
            if (!data?.accessKey) return;
            accessKey.current = data.accessKey;
            await storage.expire(`${Key.AccessKey}/${agent}`, key);
        });
    }, [storage, security, agent]);

    const writeLock2 = React.useCallback(async () => {
        if (!device.current) return;

        const storedKey: Store<string> = await storage.get(`${Key.AccessKey}/${device.current.name}`);
        const key = accessKey.current || storedKey.value;

        if (!key || !nonce.current) throw error(Message.NoAccess);

        const otp = generateOtp(key, nonce.current);

        await BleClient.write(device.current.deviceId, serviceUuid, otpUuid, textToDataView(otp));

        if (key !== storedKey.value) {
            await storage.expire(
                `${Key.AccessKey}/${device.current.name}`,
                key,
            );
        }
    }, [storage]);

    const [scan, setScan] = React.useState<boolean>();

    const clearDevice = () => {
        setLockOpen(undefined);
        setTarget(undefined);
        device.current = undefined;
    };

    const disconnect = async (
        id?: string | true
    ) => {
        if (!device.current || !id || device.current.deviceId === id) return;
        await BleClient.disconnect(device.current.deviceId);
        clearDevice();
    };

    React.useEffect(() => {
        storage.remove(Key.Skill);
        return () => {
            disconnect(true);
        }
    }, []);

    const connectDevice = React.useCallback(async () => {
        if (!device.current) return;

        if (agent && device.current.name !== agent) {
            await disconnect(true);
        }

        await BleClient.connect(device.current.deviceId, () => {
            setAgent(undefined);
            clearDevice();
        });

        await storage.set(Key.Agent, device.current.name);

        setAgent(device.current.name);

        const isLockOpen = readLock(await BleClient.read(device.current.deviceId, serviceUuid, lockUuid));
        readNonce(await BleClient.read(device.current.deviceId, serviceUuid, nonceUuid));

        await BleClient.startNotifications(device.current.deviceId, serviceUuid, nonceUuid, readNonce);
        await BleClient.startNotifications(device.current.deviceId, serviceUuid, lockUuid, readLock);

        if (!isLockOpen) {
            await writeLock2();
        }
    }, [storage, device, agent, isLockOpen]);

    const getDevice = async (
        target: string,
    ) => {
        const newDevice = await BleClient.requestDevice(bleOptions({ name: target }));
        setAgents([new Store<ScanResult>({ device: newDevice })]);
        device.current = newDevice;
    };

    const scanDevices = React.useCallback(async (
        target?: string,
        awaitTarget?: boolean,
    ) => {
        if (scan) {
            return;
        }
        try {
            const results: ScanResult[] = [];

            await new Promise<void>(async (resolve, reject) => {
                let hasTarget = false;
                try {
                    await BleClient.requestLEScan(bleOptions(), async (result) => {
                        if (target && result.device.name === target) {
                            device.current = result.device;
                            if (!awaitTarget) return;
                            hasTarget = true;
                            resolve();
                        }
                        results.push(result);
                    });

                    setScan(true);

                    if (!awaitTarget) return resolve();

                    setTimeout(() => {
                        if (!hasTarget) resolve();
                    }, agentScanInterval * 3);
                } catch (error) {
                    reject(error);
                }
            });

            setTimeout(async () => {
                await BleClient.stopLEScan();
                setAgents(results.map(agent => new Store(agent)));
                showError('stop scan');
                setScan(undefined);
            }, agentScan);
        }
        catch (error) {
            setScan(false);
            throw error;
        }
    }, [scan]);

    const scanInterval = React.useCallback(async () => {
        if (!await modalRef.current?.getCurrentBreakpoint() || target || device.current) return;
        setAgents(previousAgents => {
            const agents: Store<ScanResult>[] = [];
            const fresh = previousAgents.every(record => {
                if (isAfter(record.date, agentSleepAfter)) return false;
                agents.push(record);
                return true;
            });
            return fresh ? previousAgents : agents;
        });
        try {
            await scanDevices();
        } catch {
            setTimeout(() => setScan(undefined), animationDelay);
        }
    }, [agents, target, device]);

    React.useEffect(() => {
        const interval = setInterval(() => scanInterval(), agentScanInterval);
        return () => clearInterval(interval);
    }, []);

    const select = React.useCallback(async (
        id?: string,
    ) => {
        try {
            let newTarget = id;
            if (!newTarget) {
                const lastId = await storage.get(Key.Agent);
                if (assetsLeased) {
                    const leasedId = assetsLeased.indexOf(lastId) >= 0 ? lastId : assetsLeased[0];
                    if (leasedId) newTarget = leasedId;
                } else {
                    newTarget = lastId;
                }
            }

            setTarget(newTarget);
            if (newTarget && newTarget === agent) return await writeLock2();

            try {
                if (!agent) {
                    await modalRef.current?.present();
                    await practiceSkill(() => setSelecting(true));
                    await BleClient.initialize();
                }
                await scanDevices(newTarget, true);
            }
            catch {
                if (newTarget) await getDevice(newTarget);
                setScan(undefined);
            }
            finally {
                await connectDevice();
            }
        }
        catch (error) {
            // setConnecting(false);
            showError(error);
        }
        finally {
            setTimeout(() => setSelecting(false), animationDelay);
            setTarget(undefined);
        }
    }, [storage, assetsLeased, agent, modalRef]);

    const listLeased = React.useMemo(() => {
        if (!assetsLeased || !vehicles) return;

        return assetsLeased.map(id => {
            const isTarget = target === id;
            const isOnline = agents.some(({ value: agent }) => agent.device.name === id);
            const isConnected = agent === id;
            return (
                <VehicleListItem
                    key={id}
                    id={id}
                    vehicle={vehicles[id]}
                    isOnline={isOnline}
                    isConnected={isConnected}
                    isUnlocked={isConnected && isLockOpen}
                    isTarget={isTarget}
                    select={() => select(id)}
                    disconnect={disconnect}
                />
            );
        });
    }, [assetsLeased, agents, vehicles, agent, isLockOpen, target]);

    const listOnline = React.useMemo(() => {
        if (!agents || !vehicles) return;

        return agents.reduce((list: JSX.Element[] | undefined, record) => {
            const id = record.value.device.name;
            if (!id || !assetsLeased || assetsLeased.indexOf(id) >= 0) return;

            const item = (
                <VehicleListItem
                    key={id}
                    id={id}
                    vehicle={vehicles[id]}
                    isOnline={true}
                />
            );
            if (!list) return [item];
            list.push(item);
            return list;
        }, undefined);
    }, [
        scan,
        agents,
        // vehicles,
        assetsLeased,
    ]);

    // const [isConnecting, setConnecting] = React.useState(false);

    // React.useEffect(() => {
    //     if (isSkilled) return;
    //     if (!agent && target) {
    //         setConnecting(true);
    //     }
    // }, [isSkilled, agent, target]);

    const selectionStatus = React.useMemo(() => {
        if (!isSelecting) return;
        const isAwake = target && agents.some(({ value: agent }) => agent.device.name === target);
        const isConnected = device.current;
        return (
            <IonList className="ion-margin-top">
                <IonListHeader >
                    <IonLabel className="ion-no-margin">
                        Connnecting...
                    </IonLabel>
                </IonListHeader>
                <IonItemDivider
                    color="transparent"
                >
                    <IonLabel><p>Follow the steps below</p></IonLabel>
                </IonItemDivider>
                <IonItem lines="none">
                    <IonIcon
                        icon={isAwake ? sunnyOutline : moonOutline}
                        slot="start"
                    />
                    <IonLabel className="ion-text-nowrap">
                        {isAwake ? 'Activated' : 'Waking up...'}
                        <p>{isAwake
                            ? 'Vehicle awake'
                            : 'Move the vehicle to activate...'}</p>
                    </IonLabel>
                    {isConnected || isAwake ? done : progress}
                    {/* <IonNote slot="helper">
                        You need to move to the vehicle
                        to wake up from battery saving mode and
                        enable connectivity.
                    </IonNote> */}
                </IonItem>
                <IonItem lines="none">
                    <IonIcon
                        icon={isConnected ? bluetoothOutline : radioOutline}
                        color={isConnected ? 'dark' : 'medium'}
                        slot="start"
                    />
                    <IonLabel
                        color={isConnected || isConnected ? 'dark' : 'medium'}
                    >
                        {isConnected ? 'Paired' : 'Pairing...'}
                        <p>{isConnected ? 'Bluetooth connected' : 'Connecting via Bluetooth...'}</p>
                    </IonLabel>
                    {isConnected ? done : isConnected && progress}
                    {/* <IonNote slot="helper">
                        You are connecting to the
                        vehicle via Bluetooth to
                        to access it and then unlock it.

                    </IonNote> */}
                </IonItem>
                <IonItem lines="none">
                    <IonIcon
                        icon={isLockOpen ? lockOpenOutline : lockClosedOutline}
                        color={isLockOpen ? 'dark' : 'medium'}
                        slot="start"
                    />
                    <IonLabel color={isLockOpen ? 'dark' : 'medium'}>
                        {isLockOpen ? 'Unlocked' : 'Unlocking...'}
                        <p>{isLockOpen ? 'Secure OTP accepted' : 'Exchanging secure OTP...'}</p>
                    </IonLabel>
                    {agent && (isLockOpen ? done : progress)}
                    {/* <IonNote slot="helper">
                        You are exchanging secure
                        OTP with the vehicle
                        to unlock it and start the ride.
                    </IonNote> */}
                </IonItem>
            </IonList>
        )
    }, [agents, agent, device, isSelecting, isLockOpen, isSkilled]);

    const headerOnline = React.useMemo(() => {
        const icon = scan === true
            ? <IonSpinner name="lines-sharp-small" slot="end" />
            : scan === false && <IonIcon icon={warning} color="medium" slot="end" />;

        if (!icon && !listOnline) return;

        return (
            <IonItemDivider
                className="ion-padding-top"
                color="transparent"
            >
                <IonLabel><p>Others nearby</p></IonLabel>
                {icon}
            </IonItemDivider>
        )
    }, [agents, listOnline, scan])


    const open = async () => {
        await modalRef.current?.present();
    }
    const close = async () => {
        await modalRef.current?.dismiss();
    }

    const cancel = async () => {
        await disconnect();
        await close();
    }

    // const blur = React.useCallback(async () => {
    //     if (!target) {
    //         await close();
    //     }
    // }, [target]);

    return (
        <AgentContext.Provider value={{
            select,
            open,
            close,
            // toggle,
            isLockOpen,
            agent,
            target,
        }}>
            {props.children}
            <IonModal
                ref={modalRef}
                // isOpen={isModal}
                // isOpen={true}
                canDismiss={true}
                initialBreakpoint={Breakpoint.Min}
                breakpoints={[0, Breakpoint.Min, Breakpoint.Max]}
            // backdropBreakpoint={Breakpoint.Min}
            // onBlur={blur}
            >
                <PageHeader title="Ride">
                    <IonButtons slot="start">
                        <IonButton onClick={cancel}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                </PageHeader>
                <IonContent className="ion-padding">
                    {/* {vehicleList} */}
                    <IonList>
                        <IonListHeader >
                            <IonLabel className="ion-no-margin">
                                Vehicles
                            </IonLabel>
                        </IonListHeader>
                        <IonItemDivider
                            color="transparent"
                        >
                            <IonLabel><p>Leased</p></IonLabel>
                        </IonItemDivider>
                        <IonItem
                            detail={true}
                            lines="none"
                        >
                            <IonLabel color="secondary">
                                Find nearest vehicle
                            </IonLabel>
                        </IonItem>
                        {listLeased}
                        {headerOnline}
                        {listOnline}
                    </IonList>
                    {selectionStatus}
                </IonContent>
            </IonModal>
        </AgentContext.Provider>
    );
});

AgentProvider.displayName = 'AgentProvider'

export { AgentProvider };
