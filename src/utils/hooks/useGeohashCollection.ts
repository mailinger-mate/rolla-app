import React from 'react';
import { Geohash, geohashQueryBounds, GeohashRange } from 'geofire-common';
import { Firestore, onSnapshot, Query, QuerySnapshot, Unsubscribe } from 'firebase/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useLocationContext } from '../../contexts/Location';
import { defaultRadius } from '../../config';

interface Listener {
    geohashRange: GeohashRange;
    unsubscribe: Unsubscribe;
}

interface DocumentData {
    geohash: Geohash;
}

type GeohashCollection<Document> = Record<string, Document>;

const clearCollection = <
    Document extends DocumentData,
>(
    geohashRangesCleared: GeohashRange[],
    previousCollection?: GeohashCollection<Document>,
) => {
    if (!previousCollection) return;

    const collection: GeohashCollection<Document> = {};

    for (const id in previousCollection) {
        const document = previousCollection[id];
        const { geohash } = document;
        const isCleared = geohashRangesCleared.reduce((isCleared, [start, end]) => {
            if (geohash >= start && geohash <= end) isCleared = true;
            return isCleared;
        }, false);

        if (!isCleared) {
            collection[id] = document;
            continue;
        }
    }

    return collection;
}

const appendCollection = <
    Document extends DocumentData,
>(
    query: QuerySnapshot<Document>,
    previousCollection?: GeohashCollection<Document>,
) => {
    const docChanges = query.docChanges();
    if (!previousCollection && !docChanges.length) return;

    const collection: GeohashCollection<Document> = Object.assign({}, previousCollection);
    docChanges.forEach(({ type, doc }) => {
        const id = doc.ref.id;
        console.log('docChanges', type, doc.data())
        switch (type) {
            case 'removed': {
                delete collection[id];
                break;
            }
            default: {
                console.log(collection[id] ? 'modify document' : 'add document', id);
                collection[id] = doc.data();
            }
        }
    });

    return collection;
};

export const useGeohashCollection = <
    Document extends DocumentData,
>(
    query: (
        db: Firestore,
        geohashRange: GeohashRange,
        isLimited?: boolean,
    ) => Query<Document>
) => {
    const { db } = useFirebaseContext();
    const { location } = useLocationContext();

    const [collection, setCollection] = React.useState<GeohashCollection<Document>>();
    const listeners = React.useRef<Listener[]>([]);

    React.useEffect(() => {
        return () => {
            console.log('unmount, clean up list');
            listeners.current.forEach(listener => listener.unsubscribe())
        }
    }, []);

    const isLimited = React.useMemo(() => {
        return location && location.radius > defaultRadius;
    }, [location]);

    React.useEffect(() => {
        if (!location) return;
        const { geohashRanges } = location;
        console.log('locationQueryBounds', JSON.stringify(geohashRanges));

        const geohashRangesNear = Array.from(geohashRanges);
        const geohashRangesFar: GeohashRange[] = [];

        let listenerIndex = listeners.current.length;

        while (listenerIndex--) {
            const listener = listeners.current[listenerIndex];
            const [listenerStart, listenerEnd] = listener.geohashRange;
            const rangeIndex = geohashRangesNear.findIndex(([start, end]) =>
                start === listenerStart && end === listenerEnd);
            const inRange = rangeIndex >= 0;

            if (inRange) {
                geohashRangesNear.splice(rangeIndex, 1);
                continue;
            }

            geohashRangesFar.push(listener.geohashRange);
            listeners.current.splice(listenerIndex, 1);
            listener.unsubscribe();
        }

        if (geohashRangesFar.length) {
            setCollection(previousCollection =>
                clearCollection(geohashRangesFar, previousCollection));
        }

        geohashRangesNear.forEach(geohashRange => {
            listeners.current.push({
                unsubscribe: onSnapshot(query(db, geohashRange), query => {
                    setCollection(previousCollection =>
                        appendCollection(query, previousCollection))
                }),
                geohashRange,
            });
        });

        console.log('listeners', JSON.stringify(listeners.current));

    }, [location, isLimited]);

    return collection;
}