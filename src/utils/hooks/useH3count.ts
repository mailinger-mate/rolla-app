import React from 'react';
import { DocumentData, Firestore, getCountFromServer, Query } from 'firebase/firestore';
import { GeohashRange } from 'geofire-common';
import { useFirebaseContext } from '../../contexts/Firebase';
import { useLocationContext } from '../../contexts/Location';

export type Count = Record<string, number>;

export const useH3Count = <
    Document extends DocumentData,
>(
    query: (
        db: Firestore,
        geohashRange: GeohashRange,
    ) => Query<Document>
): Count | undefined => {
    const { db } = useFirebaseContext();
    // const { geohashRanges } = useLocationContext();

    return;
};
