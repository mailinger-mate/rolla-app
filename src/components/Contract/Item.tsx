import React from 'react';
import { IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar, useIonLoading } from '@ionic/react';
import { getVehicle, Vehicle } from '../../utils/db/vehicle';
import { setContract } from '../../utils/db/contract';
import { useFirebaseContext } from '../../contexts/Firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuthenticationContext } from '../../contexts/Authentication';
import { dayMs } from '../../utils/datetime';

interface Props {
    id: string;
    vehicle: Vehicle;
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

const formatDate = (date: Date) => date.toISOString().substring(0,10);

const ContractItem = React.memo<Props>(({
    id,
    vehicle,
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
            asset: getVehicle(db, id),
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
                <IonTitle>Contract</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={startContract}>Start</IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    ), [onCancel]);

    if (!user) {
        signIn();
        return null;
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

    return (
        <>
            {header}
            <IonContent>
                <IonList>
                    <IonListHeader>Vehicle</IonListHeader>
                    <IonItem>
                        <IonLabel>Name</IonLabel>
                        <IonLabel>{name}</IonLabel>
                    </IonItem>
                    <IonListHeader>Terms</IonListHeader>
                    <IonItem>
                        <IonLabel>Period</IonLabel>
                        <IonSelect
                            interface="action-sheet"
                            value={period}
                            onIonChange={changePeriod}
                        >
                            {periodOptions}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Start date</IonLabel>
                        <IonDatetimeButton datetime="start" />
                        <IonModal keepContentsMounted={true}>
                            <IonDatetime
                                // ref={startDate}
                                id="start"
                                presentation="date"
                                min={new Date().toISOString()}
                                value={startDate}
                                onIonChange={(event) => changeDate(event, setStartDate)}
                            />
                        </IonModal>
                    </IonItem>
                    {period > 0 && <IonItem>
                        <IonLabel>End date</IonLabel>
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
            </IonContent>
        </>
    )
});

export { ContractItem };
