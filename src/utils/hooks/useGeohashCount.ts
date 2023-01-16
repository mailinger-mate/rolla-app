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
        constrains: { geohashesExcluded: string[] },
    ) => Query<Document>
): Count => {
    const { db } = useFirebaseContext();
    const { location } = useLocationContext();

    const [count, setCount] = React.useReducer((
        state: Count | undefined,
        aggregate: { index: string, count: number }
    ) => {
        const { index, count } = aggregate;
        // let newState: Count;
        // if (!state) {
        //     newState = { [index]: count };
        // }
        // else if (state[index] !== count) {
        //     newState = {
        //         ...state,
        //         [index]: count,
        //     };
        // }
        return !state
            ? { [index]: count }
            : { ...state, [index]: count };
    }, {});

    React.useEffect(() => {
        if (!location) return;
        // Promise
        //     .all(geohashRanges.map(async (geohashRange, index) => {
        //         // const [start, end] = geohashRange;
        //         // const range = `${start}:${end}`;
        //         return Math.round(Math.random() * 1000);
        //         const [geohashesDistant] = location.geohashesSorted[index];
        //         const aggregate = await getCountFromServer(
        //             query(db, geohashRange, {
        //                 geohashesExcluded: geohashesDistant,
        //             }
        //         ));
        //         const count = aggregate.data().count;
        //         // const aggregate = await Math.round(Math.random() * 1000); // await getCountFromServer(query(db, geohashRange));
        //         // setCount({ index, count: Math.round(Math.random() * 1000) /* aggregate.data().count */ })
        //         // console.log('aggregate', range, count);
        //         // setCount({ index: range, count });
        //         return count;
        //     }))
        //     .then(counts => {
        //         // console.log(location.cellIndex, counts);
        //         setCount({
        //             index: location.h3Index,
        //             count: counts.reduce((sum, count) => sum + count),
        //         });
        //     })
    }, [location]);

    return count;
}