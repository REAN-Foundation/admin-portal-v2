import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from "$env/static/private";
import { DashboardManager } from "$routes/api/cache/dashboard/dashboard.manager";
import { get } from "./common.reancare";

export const searchPatients = async (sessionId: string, searchParams?: any) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = BACKEND_API_URL + `/patients/search${searchString}`;
    const cacheKey = `session-${sessionId}:req-searchPaitents:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    await DashboardManager.set(cacheKey, result);
    return result;
};