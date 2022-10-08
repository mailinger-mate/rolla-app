import { doc, DocumentData, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, } from "firebase/firestore";
import { Path } from "./enums";
import { getVehicle } from "./vehicle";


interface Access {
    id: string;
    key: string;
}

const converter = {
    toFirestore(access: Access): DocumentData {
        return { id: access.id };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Access {
        const { 
            id,
            accessKey,
        } = snapshot.data(options);

        return {
            id,
            key: accessKey,
        };
    }
};

export const getAccess = (db: Firestore, vehicleId: string) => {
    return getVehicle(db, vehicleId).then(vehicle => {
        const { security } = vehicle.data()!;
        return getDoc(doc(db, security.path).withConverter(converter));
    });
}