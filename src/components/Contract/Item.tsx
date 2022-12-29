import React from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonBadge, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToggle, IonToolbar, useIonLoading } from '@ionic/react';
import { getVehicle, Vehicle } from '../../utils/db/vehicle';
import { setContract } from '../../utils/db/contract';
import { useFirebaseContext } from '../../contexts/Firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuthenticationContext } from '../../contexts/Authentication';
import { dayMs } from '../../utils/datetime';
import { bulbOutline, calendarOutline, cardOutline, checkmarkOutline, documentTextOutline, enterOutline, heartOutline, hourglass, hourglassOutline, keyOutline, scanOutline, walletOutline } from 'ionicons/icons';

interface Props {
    id?: string;
    vehicle?: Vehicle;
    onCancel: () => void;
    onSubmit: () => void;
}

const periods = [0, 1, 7, 30] as const;

type Period = typeof periods[number];

const periodNames: Record<Period, string> = {
    0: 'Open',
    1: 'Daily',
    7: 'Weekly',
    30: 'Monthly'
};

const periodOptions = periods.map((key) => {
    return (<IonSelectOption value={key} key={key}>{periodNames[key]}</IonSelectOption>);
});

const timeZoneOffset = new Date().getTimezoneOffset();

const formatDate = (date: Date) => date.toISOString();

const ContractItem = React.memo<Props>(({
    id,
    vehicle = {},
    onCancel,
    onSubmit,
}) => {
    const { db } = useFirebaseContext();
    const { user, signIn } = useAuthenticationContext();
    const [present, dismiss] = useIonLoading();

    const { name } = vehicle;

    const [period, setPeriod] = React.useState<Period>(1);
    const [startDate, setStartDate] = React.useState(formatDate(new Date()));
    const [endDate, setEndDate] = React.useState<string | undefined>(formatDate(new Date(Date.now() + dayMs * 7)));

    React.useEffect(() => {
        if (!period) setEndDate(undefined);
    }, [period])


    const startContract = React.useCallback(() => {
        if (!user) return;
        present();
        setContract(db, {
            start: new Timestamp(new Date(startDate).getTime() / 1000, 0),
            end: endDate ? new Timestamp(new Date(endDate).getTime() / 1000, 0) : undefined,
            asset: id ? getVehicle(db, id) : undefined,
            user: user.uid,
        }).then(() => {
            dismiss();
            onSubmit();
        })
    }, [user])


    const header = React.useMemo(() => (
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton onClick={onCancel}>Cancel</IonButton>
                </IonButtons>
                <IonTitle>Lease</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={startContract}>Accept</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    ), [onCancel]);

    if (!user) {
        signIn();
        // return null;
    }

    const changePeriod = (event: Event) => {
        const target = event.target as HTMLIonSelectElement;
        setPeriod(target.value);
    }

    const changeDate = (event: Event, setDate: (value: string) => void) => {
        const target = event.target as HTMLIonDatetimeElement;
        if (target.value) {
            setDate(target.value as string);
            target.confirm(true)
        }
    }

    // const changeDate = (event: Event) => {
    //     const target = event.target as HTMLIonDatetimeElement;
    //     if (!Array.isArray(target.value)) return;
    //     // if (target.value?.length === 2) {

    //     // }
    //     const dates = target.value.reduce((values: string[], value, index, targetValues) => {
    //         const previousValue = targetValues[index - 1];
    //         if (!previousValue) {
    //             values.push(value);
    //         } else {
    //             const previousDate = new Date(previousValue);
    //             const date = new Date(value);
    //             const differnce = (+date - +previousDate) / dayMs
    //             if (differnce > 1) {
    //                 for (let index = 0; index < differnce; index++) {
    //                     const dateBetween = new Date(previousDate.getTime() + dayMs * index);
    //                     values.push(formatDate(dateBetween))
    //                 }
    //             }
    //         }
    //         return values;
    //     }, []);

    //     setEndDate(dates);
    // }

    const scan = React.useCallback(async () => {
        const result = await BarcodeScanner.startScan();

        // if the result has content
        if (result.hasContent) {
            console.log(result.content); // log the raw scanned content
        }
    }, []);

    const terms = React.useMemo(() => (
        <IonList>
            <IonListHeader >
                <IonLabel className="ion-no-margin">
                    Conditions
                </IonLabel>
            </IonListHeader>
            <IonItemDivider color="transparent">
                <IonLabel><p>Lease details</p></IonLabel>
            </IonItemDivider>
            <IonItem>
                <IonLabel>
                    Accept
                </IonLabel>
                <IonToggle slot="end"></IonToggle>
            </IonItem>
            <IonItem>
                <IonLabel class="ion-text-wrap">
                    Multi-line text that should ellipsis when it is too long
                    to fit on one line. Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit.
                </IonLabel>
            </IonItem>
            <IonItem>
                <IonIcon icon={cardOutline} slot="start" />
                <IonLabel>
                    Licensed
                    <p>Holding valid driver license</p>
                </IonLabel>
            </IonItem>
            <IonItem>
                <IonIcon icon={bulbOutline} slot="start" />
                <IonLabel>
                    Capable
                    <p>Fitting medically and mentally</p>
                </IonLabel>
            </IonItem>
            <IonItem>
                <IonIcon icon={heartOutline} slot="start" />
                <IonLabel>
                    Responsible
                    <p>Protecting yourself and others</p>
                </IonLabel>
            </IonItem>
        </IonList>
    ), []);

    const status = React.useMemo(() => (
        <IonList>
            <IonListHeader >
                <IonLabel className="ion-no-margin">
                    Status
                </IonLabel>
            </IonListHeader>
            <IonItemDivider
                color="transparent"
            >
                <IonLabel><p>Lease progression</p></IonLabel>
            </IonItemDivider>
            <IonItem lines="none">
                <IonIcon icon={documentTextOutline} slot="start" />
                <IonLabel>
                    Agreement
                    <p>Accept the contract</p>
                </IonLabel>
                <IonIcon icon={checkmarkOutline} slot="end" />
            </IonItem>
            <IonItem lines="none">
                <IonIcon icon={walletOutline} slot="start" />
                <IonLabel>
                    Payment
                    <p>Pay the rental fee in person</p>
                </IonLabel>
                <IonSpinner name="lines-sharp-small" slot="end" />
            </IonItem>
            <IonItem lines="none" detail={true}>
                <IonIcon icon={keyOutline} slot="start" color="medium" />
                <IonLabel color="medium">
                    Access
                    <p>Start the ride</p>
                </IonLabel>
                {/* <IonIcon icon={checkmarkOutline} slot="end" /> */}
            </IonItem>
            <IonItem lines="none" detail={true}>
                <IonIcon icon={calendarOutline} slot="start" color="medium" />
                <IonLabel color="medium">
                    Return
                    {/* <p>Drop off the vehicle</p> */}
                    <p>Khun Mam's Kitchen</p>
                </IonLabel>
                <IonNote slot="end">31 Dec</IonNote>
                {/* <IonBadge>31 Dec</IonBadge> */}
                {/* <IonIcon icon={checkmarkOutline} slot="end" /> */}
            </IonItem>
        </IonList>
    ), []);

    const vehicleItem = (
        <IonItem lines="none" detail={true}>
            <IonLabel>
                Yoyo
                <p>Honda Click 125cc</p>
            </IonLabel>
            <IonNote slot="end">AB 1234</IonNote>
            {/* <IonSpinner name="lines-sharp-small" slot="end" />
            <IonIcon icon={walletOutline} slot="end" color="warning" />
            <IonIcon icon={documentTextOutline} slot="end" color="success" /> */}
            {/* <IonNote>21 - 31 Dec</IonNote> */}
        </IonItem>
    );

    const content = React.useMemo(() => (
        <IonContent className="ion-padding">
            <IonList>
                <IonListHeader>Vehicle</IonListHeader>
                <IonItemDivider color="transparent">
                    <IonLabel><p>Leased</p></IonLabel>
                </IonItemDivider>
                {vehicleItem}
                {/* <IonItem>
                    <IonLabel>
                        Name
                    </IonLabel>
                    <IonNote>Honda Click 125cc</IonNote>
                </IonItem>
                <IonItem>
                    <IonLabel>
                        License
                    </IonLabel>
                    <IonNote>AB 1245</IonNote>
                </IonItem> */}
                {/* <IonItem detail={true} button={true} onClick={scan}>
                        <IonIcon icon={scanOutline} slot="start" />
                        <IonLabel>Scan</IonLabel>
                    </IonItem> */}

                {/* <IonListHeader >
                    <IonLabel className="ion-no-margin">
                        Dates
                    </IonLabel>
                </IonListHeader> */}

                {status}

                <IonListHeader>Terms</IonListHeader>
                <IonItemDivider color="transparent">
                    <IonLabel><p>Location</p></IonLabel>
                </IonItemDivider>
                <IonItem detail={true} lines="none">
                    <IonLabel>Station</IonLabel>
                    <IonLabel slot="end">Khun Mam's Kitchen</IonLabel>
                    {/* <IonLabel>{name}</IonLabel> */}
                </IonItem>
                <IonItem lines="none">
                    <IonLabel>Address</IonLabel>
                    <IonNote slot="end">Moo 2, Ko Mak, 12330</IonNote>
                    {/* <IonLabel>{name}</IonLabel> */}
                </IonItem>

                <IonItemDivider color="transparent">
                    <IonLabel><p>Dates</p></IonLabel>
                </IonItemDivider>
                <IonItem lines="none">
                    <IonLabel>Period</IonLabel>
                    <IonSelect
                        interface="action-sheet"
                        value={period}
                        onIonChange={changePeriod}
                    >
                        {periodOptions}
                    </IonSelect>
                </IonItem>
                <IonItem lines="none">
                    <IonLabel>Start</IonLabel>
                    <IonDatetimeButton datetime="start" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            // ref={startDate}
                            id="start"
                            presentation="date-time"
                            min={new Date().toISOString()}
                            value={startDate}
                            onIonChange={(event) => changeDate(event, setStartDate)}
                        />
                    </IonModal>
                </IonItem>
                {period > 0 && <IonItem lines="none">
                    <IonLabel>Return</IonLabel>
                    <IonDatetimeButton datetime="end" />
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime
                            // ref={startDate}
                            id="end"
                            // multiple={true}
                            presentation="date"
                            min={new Date(new Date(startDate).getTime() + dayMs).toISOString()}
                            value={endDate}
                            onIonChange={(event) => changeDate(event, setEndDate)}
                        // onIonChange={changeDate}
                        />
                    </IonModal>
                </IonItem>}
            </IonList>
            {/* <IonList>

                <IonListHeader >
                    <IonLabel className="ion-no-margin">
                        Vehicle
                    </IonLabel>
                </IonListHeader>
                <IonItemDivider color="transparent" >
                    <IonLabel><p>Leased</p></IonLabel>
                </IonItemDivider>

            </IonList> */}
            {/* <IonList>
                <IonListHeader >
                    <IonLabel className="ion-no-margin">
                        Details
                    </IonLabel>
                </IonListHeader>
                <IonItemDivider color="transparent" >
                    <IonLabel><p>Lease terms</p></IonLabel>
                </IonItemDivider>

                <IonItem lines="none">
                    <IonLabel color="medium">Station name</IonLabel>
                    <IonNote>Khun Mam's Kitchen</IonNote>
                </IonItem>
                <IonItem lines="none">
                    <IonLabel color="medium">Address</IonLabel>
                    <IonNote>Moo 2, Ko Mak, 12330</IonNote>
                </IonItem>
                <IonItem lines="none">
                    <IonLabel color="medium">Vehicle</IonLabel>
                    <IonNote>Honda Click 125cc</IonNote>
                </IonItem>
                <IonItem lines="none">
                    <IonLabel color="medium">License</IonLabel>
                    <IonNote>AB 1245</IonNote>
                </IonItem>
                <IonItem lines="none">
                    <IonLabel color="medium">Period</IonLabel>
                    <IonNote>17/12/2022 - 28/12/2022</IonNote>
                </IonItem>
            </IonList> */}
        </IonContent>
    ), []);

    return (
        <>
            {header}
            {content}
        </>
    );
});

export { ContractItem };
