import {useStore } from 'react-admin';

export interface ObjectStore {
    value: any | null;
    set: (value: any) => void;
    clear: () => void;
}

export const useObjectStore = (storeKey: string): ObjectStore => {
    const [value, setValue] = useStore<any | null>(storeKey, null);

    const set = (nextValue: any) => {
        setValue(nextValue);
    };

    const clear = () => {
        setValue(null);
    };

    return {
        value,
        set,
        clear,
    };
};

