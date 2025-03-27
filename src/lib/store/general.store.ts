import { writable, derived, get, type Writable } from 'svelte/store';

///////////////////////////////////////////////////////////////////

function createMapStore(initial: any) {
    const store = writable(initial);
    const set = (key: any, value: any) => store.update(m => Object.assign({}, m, {[key]: value}));
    const results = derived(store, s => ({
        keys: Object.keys(s),
        values: Object.values(s),
        entries: Object.entries(s),
        set(k: any, v: any) {
            store.update(s => Object.assign({}, s, {[k]: v}))
        },
        remove(k: string | number) {
            store.update(s => {
                delete s[k];
                return s;
            });
        }
    }));
    return {
        subscribe: results.subscribe,
        set: store.set,
    }
}

export const personRolesStore = writable();
export const currentUserRoleStore = writable('');
export const genderTypesStore = writable([]);
export const oragnizationTypesStore = writable([]);
export const showGetApiKeyModal = writable(false);
export const showRenewApiKeyModal = writable(false);
export const scoringApplicableCondition = writable(false);
export const showScoringConditionModal = writable(false);
export const ageWiseUsersData = writable();
export const tabSet = writable(0);
export const selectedItems = writable([]);
// export const items = writable([]);