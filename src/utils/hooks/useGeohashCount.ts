import React from 'react';
import { DocumentData, Firestore, getCountFromServer, Query } from 'firebase/firestore';
import { GeohashRange } from 'geofire-common';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useLocationContext } from '../../contexts/Location';

export type Count = Record<string, number>;

export const useGeohashCount = <
    Document extends DocumentData,
>(
    query: (
        db: Firestore,
        geohashRange: GeohashRange,
        isLimited?: boolean,
    ) => Query<Document>
): Count | undefined => {
    const { db } = useFirebaseContext();
    const { location } = useLocationContext();

    const [count, setCount] = React.useReducer((
        state: Count | undefined,
        aggregate: { index: string, count: number }
    ) => {
        const { index, count } = aggregate;
        let newState: Count;
        if (!state) {
            newState = { [index]: count };
        }
        else if (state[index] !== count) {
            newState = {
                ...state,
                [index]: count,
            };
        }
        return (!state
            ? { [index]: count }
            : state[index] !== count
                ? { ...state, [index]: count } 
                : false) || state;
    }, undefined);

    React.useEffect(() => {
        if (!location) return;
        location.geohashRanges.forEach(async (geohashRange) => {
            const [start, end] = geohashRange;
            const index = `${start}:${end}`;
            // const aggregate = await Math.round(Math.random() * 1000); // await getCountFromServer(query(db, geohashRange));
            setCount({ index, count: Math.round(Math.random() * 1000) /* aggregate.data().count */ })
        });
    }, [location]);

    return count;
}