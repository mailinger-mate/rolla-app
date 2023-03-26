import React from 'react';
import { DocumentData, Firestore, getCountFromServer, Query } from 'firebase/firestore';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useLocationContext } from '../../contexts/Location';
import { H3Index } from 'h3-js';

export interface H3Aggregates {
    cells: Record<string, number>;
    resolution?: number;
    total?: number;
    max?: number;
}

interface H3Aggregate {
    h3Index: string;
    h3Resolution: number;
    count: number;
}

export const useH3Aggregates = <
    Document extends DocumentData,
>(
    query: (
        db: Firestore,
        h3IndexStart: H3Index,
        h3IndexEnd: H3Index,
    ) => Query<Document>
): H3Aggregates => {
    const { db } = useFirebaseContext();
    const {
        location: {
            h3Index,
            h3RangeStart,
            h3RangeEnd,
            h3Resolution
        },
        scope,
    } = useLocationContext();

    const [aggregates, setAggregate] = React.useReducer<
        React.Reducer<H3Aggregates, H3Aggregate>
    >((
        { cells, max, resolution, total },
        aggregate,
    ) => {
        if (!aggregate) return { cells: {} };
        const { count, h3Index, h3Resolution } = aggregate;
        const preserve = resolution === h3Resolution;
        console.log('setAggregate', { count, h3Index })
        return {
            cells: {
                ...(preserve && cells),
                [h3Index]: count
            },
            max: max && max > count ? max : count,
            resolution: h3Resolution,
            total: (preserve && total || 0) + count,
        };
    }, {
        cells: {},
    });

    React.useEffect(() => {
        if (!scope) return;
        getCountFromServer(query(db, h3RangeStart, h3RangeEnd))
            .then(aggregate => {
                const count = aggregate.data().count;
                console.log('useH3Aggregates', h3RangeStart, h3RangeEnd, count);
                setAggregate({
                    count,
                    h3Index,
                    h3Resolution,
                });
            })
    }, [
        h3Index,
        h3RangeStart,
        h3RangeEnd,
        h3Resolution,
        scope,
    ]);

    return aggregates;
};
