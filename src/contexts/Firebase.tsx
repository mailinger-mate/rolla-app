import React from 'react';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { Firestore, getFirestore } from 'firebase/firestore';

interface Context {
    app: FirebaseApp;
    analytics: Analytics;
    db: Firestore;
}

// console.log(process.env)

const app = initializeApp({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    authDomain: "majestic-choir-349109.firebaseapp.com",
    projectId: "majestic-choir-349109",
    storageBucket: "majestic-choir-349109.appspot.com",
    messagingSenderId: "939134677637",
    appId: "1:939134677637:web:2f3e359bbaef50eb70afec",
    measurementId: "G-H88SN7CTLJ"
});

const analytics = getAnalytics(app);
const db = getFirestore(app);

const FirebaseContext = React.createContext<Context>({
    app,
    analytics,
    db,
});

export const useFirebaseContext = () => React.useContext(FirebaseContext);

const FirebaseProvider = React.memo((props) => {
    return (
        <FirebaseContext.Provider value={{ app, analytics, db }}>
            {props.children}
        </FirebaseContext.Provider>
    );

});

FirebaseProvider.displayName = 'FirebaseProvider';

export default FirebaseProvider;
