import {
    collection, doc, query, where,
    getDoc, getDocs,
    DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, orderBy, setDoc, updateDoc, startAt, endAt, QueryConstraint, GeoPoint, limit, getCountFromServer,
} from "firebase/firestore";
import { GeohashRange } from "geofire-common";
import { Path } from "./enums";
import { Security } from "./security";
import { Station } from "./station";

export interface Vehicle {
    free: boolean;
    geohash: string;
    isOnline: boolean;
    licenseId: string;
    location: GeoPoint;
    model: string;
    name: string;
    security: DocumentReference<Security>;
    station: DocumentReference<Station>;
}

const converter = {
    toFirestore(vehicle: Vehicle): DocumentData {
        return vehicle;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Vehicle {
        const {
            free,
            geohash,
            licenseId,
            location,
            model,
            name,
            security,
            station,
        } = snapshot.data(options);
        return {
            free,
            geohash,
            isOnline: !!security,
            licenseId,
            location,
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
    const constraints: QueryConstraint[] = [orderBy('name')];
    if (stationId) {
        constraints.push(where(
            'station',
            '==',
            doc(db, Path.station, stationId)
        ));
    }
    return query(collection(db, Path.vehicle), ...constraints).withConverter(converter);
}

export const getVehiclesAt = (
    db: Firestore,
    geohashRange: GeohashRange,
    isLimited?: boolean,
) => {
    const [ start, end ] = geohashRange;
    const constrains: QueryConstraint[] = [
        orderBy('geohash'),
        startAt(start),
        endAt(end),
    ];
    if (isLimited) constrains.push(limit(1));
    return query(
        collection(db, Path.vehicle),
        ...constrains,
    ).withConverter(converter);
};

export const setVehicle = (db: Firestore, vehicle: Partial<Vehicle>, id?: string) => {
    const document = (id
        ? doc(db, Path.vehicle, id)
        : doc(collection(db, Path.vehicle))).withConverter(converter);
    return id
        ? updateDoc(document, vehicle)
        : setDoc(document, vehicle).then(() => document.id);
}