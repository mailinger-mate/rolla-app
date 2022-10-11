import {
    collection, doc, query, where,
    getDoc, getDocs,
    DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, orderBy,
} from "firebase/firestore";
import { Path } from "./enums";

interface Data extends DocumentData {
    security: DocumentReference;
}

interface Vehicle {
    // id: string;
    name: string;
    model: string;
    licenseId: string;
    isOnline: boolean;
    security: DocumentReference;
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
            id,
            licenseId,
            model,
            name,
            security,
        } = snapshot.data(options)! as Data;
        return {
            // id,
            name,
            isOnline: !!security,
            security,
            licenseId,
            model,
        };
    }
};

interface Query {
    station?: string;
}

export const getVehicle = (db: Firestore, id: string) => {
    return doc(db, Path.vehicle, id).withConverter(converter);
}

export const getVehicles = (db: Firestore, { station }: Query = {}) => {
    const constraints = [orderBy('name')];
    if (station) constraints.push(where('station', '==', doc(db, Path.station, station)));
    return query(collection(db, Path.vehicle), ...constraints).withConverter(converter);
}