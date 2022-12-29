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
): Count => {
    const { db } = useFirebaseContext();
    const { geohashRanges: locationQueryBounds } = useLocationContext();

    const [count, setCount] = React.useReducer((
        state: Count,
        aggregate: { index: string, count: number }
    ) => {
        const { index, count } = aggregate;
        if (!state) {
            return { [index]: count };
        }
        else if (state[index] !== count) {
            return {
                ...state,
                [index]: count,
            };
        }
        return state;
    }, {});

    React.useEffect(() => {
        if (!locationQueryBounds) return;
        locationQueryBounds.forEach(async (geohashRange) => {
            const [start, end] = geohashRange;
            const index = `${start}:${end}`;
            const aggregate = await getCountFromServer(query(db, geohashRange));
            setCount({ index, count: aggregate.data().count })
        });
    }, [locationQueryBounds]);

    return count;
}