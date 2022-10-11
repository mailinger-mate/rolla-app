import { doc, DocumentData, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, collection, } from "firebase/firestore";
import { Path } from "./enums";
import { getVehicle } from "./vehicle";


interface Security {
    // id: string;
    accessKey: string;
    isEnabled: boolean;
}

const converter = {
    toFirestore(access: Security): DocumentData {
        return access;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Security {
        const { 
            accessKey,
            isEnabled,
        } = snapshot.data(options);

        return {
            accessKey,
            isEnabled,
        };
    }
};

export const getSecurity = (db: Firestore, id: string) => {
    return doc(db, Path.security, id).withConverter(converter);
}

export const getVehicleSecurity = (db: Firestore, vehicleId: string) => {
    return getDoc(getVehicle(db, vehicleId)).then(vehicle => {
        const { security } = vehicle.data()!;
        return getDoc(doc(db, security.path).withConverter(converter));
    });
}

export const setSecurity = (db: Firestore, security?: Security) => {
    return doc(collection(db, Path.security));
}