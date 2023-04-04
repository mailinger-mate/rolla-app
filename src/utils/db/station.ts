import React from 'react';
import { doc, DocumentData, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, GeoPoint, collection, query, setDoc, orderBy, deleteDoc, startAt, endAt, onSnapshot, QuerySnapshot, QueryConstraint } from 'firebase/firestore';
import { geohashQueryBounds, GeohashRange } from 'geofire-common';
import { Path } from './enums';
import { H3Index } from 'h3-js';

export interface Station {
    // id: string;
    address: string;
    geohash: string;
    h3Index: H3Index;
    location: GeoPoint;
    name: string;
}

const converter = {
    toFirestore(station: Station): DocumentData {
        return station;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Station {
        const { 
            // id,
            address,
            geohash,
            h3Index,
            location,
            name,
        } = snapshot.data(options);

        return {
            // id,
            address,
            geohash,
            h3Index,
            location,
            name,
        };
    }
};

export const getStation = (db: Firestore, id: string) => {
    return doc(db, Path.station, id).withConverter(converter);
}

export const getStations = (db: Firestore) => {
    return query(collection(db, Path.station), orderBy('name')).withConverter(converter);
}

export const getStationsByH3Range = (
    db: Firestore,
    h3Start: H3Index,
    h3End: H3Index,
) => {
    const constrains: QueryConstraint[] = [
        orderBy('h3Index'),
        startAt(h3Start),
        endAt(h3End),
    ];
    return query(
        collection(db, Path.station),
        ...constrains,
    ).withConverter(converter);
};

export const setStation = (
    db: Firestore,
    station: Partial<Station>,
    id?: string,
) => {
    const document = id
        ? doc(db, Path.station, id)
        : doc(collection(db, Path.station));
        
    return setDoc(document.withConverter(converter), station).then(() => document.id);
}

export const deleteStation = (db: Firestore, id: string) => {
    return deleteDoc(doc(db, Path.station, id));
}