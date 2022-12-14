import React from 'react';
import { doc, DocumentData, Firestore, getDoc, QueryDocumentSnapshot, SnapshotOptions, GeoPoint, collection, query, setDoc, orderBy, deleteDoc, startAt, endAt, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { geohashQueryBounds, GeohashRange } from 'geofire-common';
import { Path } from './enums';

export interface Station {
    // id: string;
    name: string;
    location: GeoPoint;
    geohash: string;
    address: string;
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
            name,
            location,
            geohash,
            address,
        } = snapshot.data(options);

        return {
            // id,
            name,
            location,
            geohash,
            address,
        };
    }
};

export const getStation = (db: Firestore, id: string) => {
    return doc(db, Path.station, id).withConverter(converter);
}

export const getStations = (db: Firestore) => {
    return query(collection(db, Path.station), orderBy('name')).withConverter(converter);
}

export const getStationsAt = (
    db: Firestore,
    geohashRange: GeohashRange,
) => {
    const [ start, end ] = geohashRange;
    return query(
        collection(db, Path.station),
        orderBy('geohash'),
        startAt(start),
        endAt(end)
    ).withConverter(converter);
};

export const setStation = (db: Firestore, station: Station, id?: string) => {
    const document = id
        ? doc(db, Path.station, id)
        : doc(collection(db, Path.station));
        
    return setDoc(document.withConverter(converter), station).then(() => document.id);
}

export const deleteStation = (db: Firestore, id: string) => {
    return deleteDoc(doc(db, Path.station, id));
}