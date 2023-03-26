import React from 'react';
import { DocumentChange, DocumentData, Firestore, getDocs, Query } from "firebase/firestore";
import { H3Index } from "h3-js";
import { useFirebaseContext } from "../../contexts/Firebase";
import { useLocationContext } from "../../contexts/Location";
import { h3ResolutionLocation } from '../../config';

export const useH3Collection = <
    Document extends DocumentData,
>(
    query: (
        db: Firestore,
        h3IndexStart: H3Index,
        h3IndexEnd: H3Index,
    ) => Query<Document>,
) => {
    const { db } = useFirebaseContext();
    const {
        location: {
            h3RangeStart,
            h3RangeEnd,
            h3Resolution
        },
        scope,
    } = useLocationContext();

    const [collection, setCollection] = React.useState<Record<string, Document>>();

    React.useEffect(() => {
        if (!scope || h3Resolution <= h3ResolutionLocation) return setCollection(undefined);

        getDocs(query(db, h3RangeStart, h3RangeEnd))
            .then(querySnapshot => {
                querySnapshot
                    .docChanges()
                    .forEach(({ type, doc }) => {
                        setCollection((previousState) => {
                            const state = Object.assign({}, previousState);
                            const id = doc.ref.id;
                            switch (type) {
                                case 'removed': {
                                    delete state[id];
                                    break;
                                }
                                default: {
                                    state[id] = doc.data();
                                }
                            }
                            return state;
                        });
                    });
            })
    }, [
        h3RangeStart,
        h3RangeEnd,
        h3Resolution,
        scope,
    ])

    return collection;
}