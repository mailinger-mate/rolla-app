import React from 'react';
// import { FirebaseAuthentication, User } from '@capacitor-firebase/authentication';
import { FirebaseError } from 'firebase/app';
import {
    getAuth,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthErrorCodes,
    User,
} from 'firebase/auth';
import { useFirebaseContext } from './Firebase';

interface Context {
    user: User | null;
    signInWithEmailAndPassword: (email: string, password: string) => void;
    signOut: () => void;
}

const AuthenticationContext = React.createContext<Context>({
    user: null,
    signInWithEmailAndPassword: () => undefined,
    signOut: () => undefined,
});

export const useAuthenticationContext = () => React.useContext(AuthenticationContext);

const AuthenticationProvider: React.FC = (props) => {
    const { app } = useFirebaseContext();
    const [ auth ] = React.useState(getAuth(app))
    const [ user, setUser ] = React.useState<User | null>(auth.currentUser);

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

    const enter = (
        email: string,
        password: string,
    ) => {
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

    const context: Context = {
        user,
        signInWithEmailAndPassword: enter,
        signOut: leave,
    };

    return (
        <AuthenticationContext.Provider value={context}>
            {props.children}
        </AuthenticationContext.Provider>
    );
};

export default AuthenticationProvider;