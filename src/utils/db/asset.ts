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

export interface Asset {
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
    toFirestore(asset: Asset): DocumentData {
        return asset;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Asset {
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

export const getAsset = (db: Firestore, id: string) => {
    return doc(db, Path.asset, id).withConverter(converter);
}

export const getAssets = (
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
    return query(collection(db, Path.asset), ...constraints).withConverter(converter);
}

export const getAssetsByAgent = (
    db: Firestore,
    agentIds: string[],
) => {
    return getDocs(query(
        collection(db, Path.asset),
        where(
            'agent',
            'in',
            agentIds.map(agentId => doc(db, Path.agent, agentId))
        )
    ).withConverter(converter));
}

export const getAssetsByH3Range = (
    db: Firestore,
    h3Start: H3Index,
    h3End: H3Index,
) => {
    // const [ start, end ] = geohashRange;
    const constrains: QueryConstraint[] = [
        orderBy('h3Index'),
        startAt(h3Start),
        endAt(h3End),
    ];
    // console.log('geohash', start, end, geohashesExcluded)
    // if (geohashesExcluded?.length) constrains.push(where('geohash', 'not-in', geohashesExcluded));
    // if (single) constrains.push(limit(1));

    return query(
        collection(db, Path.asset),
        ...constrains,
    ).withConverter(converter);
};

export const setAsset = (db: Firestore, asset: Partial<Asset>, id?: string) => {
    const document = (id
        ? doc(db, Path.asset, id)
        : doc(collection(db, Path.asset))).withConverter(converter);
    return id
        ? updateDoc(document, asset)
        : setDoc(document, asset).then(() => document.id);
}