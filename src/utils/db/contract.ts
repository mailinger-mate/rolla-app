import { doc, DocumentData, Firestore, QueryDocumentSnapshot, SnapshotOptions, DocumentReference, collection, query, orderBy, where, Timestamp, setDoc, QueryConstraint, } from "firebase/firestore";
import { Path } from "./enums";
import { Vehicle } from "./vehicle";

enum Status {
    Approved = 200,
}

export interface Contract {
    status: Status;
    end: Timestamp;
    start: Timestamp;
    asset: DocumentReference<Vehicle>;
    user: string;
}

const converter = {
    toFirestore(contract: Contract): DocumentData {
        return contract;
    },

    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Contract {
        const {
            asset,
            end,
            start,
            status,
            user,
        } = snapshot.data(options);

        return {
            asset,
            end,
            start,
            status,
            user,
        };
    }
};

export const getContract = (db: Firestore, id: string) => {
    return doc(db, Path.contract, id).withConverter(converter);
}

export const getContracts = (db: Firestore, active?: boolean) => {
    const constraints: QueryConstraint[] = [orderBy('end')];
    if (active) constraints.push(where('end', '>' , new Date()));
    return query(collection(db, Path.contract), ...constraints).withConverter(converter);
}

export const setContract = (db: Firestore, contract: Partial<Contract>, id?: string) => {
    const document = id
        ? doc(db, Path.contract, id)
        : doc(collection(db, Path.contract));
        
    return setDoc(document.withConverter(converter), contract).then(() => document.id);
}