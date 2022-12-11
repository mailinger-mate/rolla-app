import { IonContent, IonPage } from '@ionic/react';
import React from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { ContractList } from '../../components/Contract/List';
import { PageHeader } from '../../components/Layout/PageHeader';
import { useFirebaseContext } from '../../contexts/Firebase';
import { getContracts } from '../../utils/db/contract';

const ActivityPage = React.memo(() => {
    return (
        <IonPage>
            <PageHeader title="Acivitiy" menuButton={true} />
            <IonContent>
                <ContractList />
            </IonContent>
        </IonPage>
    )
});

export { ActivityPage };
