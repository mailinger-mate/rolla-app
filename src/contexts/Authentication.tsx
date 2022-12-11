import React from 'react';
// import { FirebaseAuthentication, User } from '@capacitor-firebase/authentication';
import { FirebaseError } from 'firebase/app';
import {
    initializeAuth,
    getAuth,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthErrorCodes,
    User,
    indexedDBLocalPersistence,
} from 'firebase/auth';
import { useFirebaseContext } from './Firebase';
import { IonButton, IonButtons, IonContent, IonInput, IonItem, IonLabel, IonList, IonModal } from '@ionic/react';
import { PageHeader as Header } from '../components/Layout/PageHeader';
import { UserAuthentication } from '../components/UserAuthentication';

interface Context {
    user: User | null;
    // signInWithEmailAndPassword: (email: string, password: string) => void;
    signIn: () => void;
    signOut: () => void;
}

const AuthenticationContext = React.createContext<Context>({
    user: null,
    // signInWithEmailAndPassword: () => undefined,
    signIn: () => undefined,
    signOut: () => undefined,
});

export const useAuthenticationContext = () => React.useContext(AuthenticationContext);

const AuthenticationProvider = React.memo((props) => {
    const { app } = useFirebaseContext();
    const [auth] = React.useState(initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
    }))
    const [user, setUser] = React.useState<User | null>(auth.currentUser);

    const [email, setEmail] = React.useState<string | null | undefined>(user?.email);
    const [password, setPassword] = React.useState<string | undefined>();

    const [isModal, setModal] = React.useState(false);

    const signUp = (
        email: string,
        password: string,
    ) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user);
            });
        // FirebaseAuthentication
        //     .createUserWithEmailAndPassword({ email, password })
        //     .then(result => {
        //         if (result.user) setUser(result.user);
        //     });
    };

    React.useEffect(() => {
        auth.onAuthStateChanged(newUser => {
            setUser(newUser);
        });
    }, [user]);

    console.log('user', user?.email);

    const enter = () => {
        if (!email || !password) return;
        return signInWithEmailAndPassword(auth, email, password)
            // .then(userCredential => {
            //     setUser(userCredential.user)
            // })
            .catch((error: FirebaseError) => {
                switch (error.code) {
                    case AuthErrorCodes.USER_DELETED: return signUp(email, password);
                }
            });
        // FirebaseAuthentication
        //     .signInWithEmailAndPassword({ email, password })
        //     .then(result => {
        //         if (result.user) setUser(result.user);
        //     })
        //     .catch((error: FirebaseError) => {
        //         switch (error.code) {
        //             case AuthErrorCodes.USER_DELETED: createUserWithEmailAndPassword(email, password);
        //         }
        //     });
    };

    const leave = () => {
        signOut(auth);
    }

    const context = React.useMemo(() => ({
        user,
        // signInWithEmailAndPassword: enter,
        signIn: () => setModal(true),
        signOut: leave,
    }), [user]);

    const cancel = () => {
        setModal(false);
    }

    const signIn = () => {
        if (!email || !password) return;
        signInWithEmailAndPassword(auth, email, password).then(() => {
            setModal(false);
        })
    }

    return (
        <AuthenticationContext.Provider value={context}>
            {props.children}
            <IonModal
                isOpen={isModal}
            >
                <Header
                    title="Account"
                >
                    <IonButtons slot="secondary">
                        <IonButton onClick={cancel}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="primary">
                        <IonButton onClick={signIn} color="primary">
                            Sign in
                        </IonButton>
                    </IonButtons>
                </Header>
                <IonContent className="ion-padding">

                    <IonList>
                        <IonItem>
                            <IonLabel>Email</IonLabel>
                            <IonInput
                                type="email"
                                required={true}
                                value={email}
                                readonly={!!user}
                                onIonChange={e => setEmail(e.detail.value!)}
                            />
                        </IonItem>
                        {!user && (
                            <IonItem>
                                <IonLabel>Password</IonLabel>
                                <IonInput
                                    type="password"
                                    value={password}
                                    onIonChange={e => setPassword(e.detail.value!)}
                                />
                            </IonItem>
                        )}
                    </IonList>
                </IonContent>
            </IonModal>
        </AuthenticationContext.Provider>
    );
});

export default AuthenticationProvider;