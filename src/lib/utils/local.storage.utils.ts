import { browser } from "$app/environment";

//IMP: This will only be set on Client Side. Not available for SSR.

export class LocalStorageUtils {

    static setItem = (key: string, item: string) => {
        if (browser) {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
            localStorage.setItem(key, item);
        }
    }

    static getItem = (key: string) => {
        if (browser) {
            return localStorage.getItem(key);
        }
        return null;
    }

    static removeItem = (key: string) => {
        if (browser) {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        }
    }
}
