import {
    collection, doc, query, where,
    getDoc, getDocs,
    DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, orderBy, setDoc, updateDoc, startAt, endAt, QueryConstraint, GeoPoint, limit, getCountFromServer,
} from "firebase/firestore";
import { GeohashRange } from "geofire-common";
import { H3Index } from "h3-js";
import { Path } from "./enums";
import { Security } from "./security";
import { Station } from "./station";

export interface Vehicle {
    free: boolean;
    h3Index: H3Index;
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
            h3Index,
            licenseId,
            location,
            model,
            name,
            security,
            station,
        } = snapshot.data(options);
        return {
            free,
            h3Index,
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

interface VehiclesAtConstrains {
    single?: boolean;
    geohashesExcluded?: string[];
}

export const getVehiclesAt = (
    db: Firestore,
    h3IndexStart: H3Index,
    h3IndexEnd: H3Index,
    // { geohashesExcluded, single }: VehiclesAtConstrains = {}
) => {
    // const [ start, end ] = geohashRange;
    const constrains: QueryConstraint[] = [
        orderBy('h3Index'),
        startAt(h3IndexStart),
        endAt(h3IndexEnd),
    ];
    // console.log('geohash', start, end, geohashesExcluded)
    // if (geohashesExcluded?.length) constrains.push(where('geohash', 'not-in', geohashesExcluded));
    // if (single) constrains.push(limit(1));

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