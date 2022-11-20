import {
    collection, doc, query, where,
    getDoc, getDocs,
    DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, orderBy, setDoc,
} from "firebase/firestore";
import { Path } from "./enums";

export interface Vehicle {
    // id: string;
    name: string;
    model: string;
    licenseId: string;
    isOnline: boolean;
    security: DocumentReference;
    station: DocumentReference;
}

const converter = {
    toFirestore(vehicle: Vehicle): DocumentData {
        return { name: vehicle.name };
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Vehicle {
        const {
            // id,
            licenseId,
            model,
            name,
            security,
            station,
        } = snapshot.data(options);
        return {
            // id,
            isOnline: !!security,
            licenseId,
            model,
            name,
            security,
            station,
        };
    }
};

export const getVehicle = (db: Firestore, id: string) => {
    return doc(db, Path.vehicle, id).withConverter(converter);
}

export const getVehicles = (
    db: Firestore,
    stationId?: string
) => {
    const constraints = [orderBy('name')];
    if (stationId) {
        constraints.push(where(
            'station',
            '==',
            doc(db, Path.station, stationId)
        ));
    }
    return query(collection(db, Path.vehicle), ...constraints).withConverter(converter);
}

export const setVehicle = (db: Firestore, vehicle: Partial<Vehicle>, id?: string) => {
    const document = id
        ? doc(db, Path.vehicle, id)
        : doc(collection(db, Path.vehicle));
        
    return setDoc(document.withConverter(converter), vehicle).then(() => document.id);
}