import React from 'react';
import { IonButton, IonInput, IonItem, IonLabel, IonList } from '@ionic/react';
import { useAuthenticationContext } from '../contexts/Authentication';

const UserAuthentication: React.FC = () => {
    const { user, signInWithEmailAndPassword, signOut } = useAuthenticationContext();
    const [ email, setEmail ] = React.useState<string | null | undefined>(user?.email);
    const [ password, setPassword ] = React.useState<string | undefined>();

    // const [ newPassword, setNewPassword ] = React.useState<string | undefined>();
    // const [ confirmPassword, setConfirmPassword ] = React.useState<string | undefined>();

    React.useEffect(
        () => {
            if (!user?.email) return;
            setEmail(user?.email);
            setPassword(undefined);
        },
        [user?.email],
    );

    const signIn = React.useCallback( () => {
        if (!email || !password) return;
        signInWithEmailAndPassword(email, password);
    }, [email, password]);

    return (
        <IonList>
            <IonItem>
                <IonLabel position="floating">Email</IonLabel>
                <IonInput
                    type="email"
                    required={true}
                    value={email}
                    readonly={!!user}
                    onIonChange={e => setEmail(e.detail.value!)}
                />
            </IonItem>
            {user
                ? (<>
                    {/* <IonItem>
                        <IonLabel position="floating">New Password</IonLabel>
                        <IonInput
                            type="password"
                            value={newPassword}
                            onIonChange={e => setNewPassword(e.detail.value!)}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Confirm Password</IonLabel>
                        <IonInput
                            type="password"
                            value={confirmPassword}
                            onIonChange={e => setConfirmPassword(e.detail.value!)}
                        />
                    </IonItem>
                    <IonButton
                        color="primary"
                        expand="full"
                        onClick={signOut}
                    >
                        Update
                    </IonButton> */}
                    <IonButton
                        color="tertiary"
                        expand="full"
                        onClick={signOut}
                    >
                        Leave
                    </IonButton>
                </>)
                : (<>
                    <IonItem>
                        <IonLabel position="floating">Password</IonLabel>
                        <IonInput
                            type="password"
                            value={password}
                            onIonChange={e => setPassword(e.detail.value!)}
                        />
                    </IonItem>
                    <IonButton
                        color="secondary"
                        expand="full"
                        onClick={signIn}
                    >
                        Enter
                    </IonButton>
                </>)
            }
        </IonList>
    )
}

export default UserAuthentication;