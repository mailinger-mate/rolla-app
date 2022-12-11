import React from 'react';
import { Storage } from '@ionic/storage';
import { storageExpiry } from '../config';
import { isAfter } from '../utils/datetime';



const storage = new Storage();
storage.create();

class Record<Value> {
    public readonly date;
    constructor(
        public readonly value: Value,
    ) {
        this.date = new Date();
    }
}

const expire = (
    key: string,
    value: unknown,
) => {
    return storage.set(key, new Record(value))
}

interface Context extends Pick<Storage, 'get' | 'set'> {
    expire: (
        key: string,
        value: unknown,
    ) => Promise<unknown>
}

const context: Context = {
    expire,
    get: (key) => storage.get(key),
    set: (key, value) => storage.set(key, value),
}

const StorageContext = React.createContext<Context>(context);

const useStorageContext = () => React.useContext(StorageContext);

const StorageProvider = React.memo(({ children }) => {

    React.useEffect(() => {
        storage.forEach((record, key)=> {
            if (record instanceof Record && isAfter(record.date, storageExpiry)) {
                storage.remove(key);
            }
        });
    }, []);
    
    return (
        <StorageContext.Provider value={context}>
            {children}
        </StorageContext.Provider>
    )
});

export {
    Record,
    StorageProvider,
    useStorageContext,
}