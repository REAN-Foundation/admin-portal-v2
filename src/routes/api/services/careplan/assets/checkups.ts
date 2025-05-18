import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createChallenges = async (
    sessionId: string,
    name: string,
    description: string,
    tags: string[],
    version: string
) => {
    const body = {
        Name: name,
        Description: description,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/checkups';
    const result = await post(sessionId, url, body, true);

    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};

export const getCheckupsById = async (sessionId: string, checkupsId: string) => {
    const cacheKey = `session-${sessionId}:req-getCheckupsById-${checkupsId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchCheckups = async (sessionId: string, searchParams: Record<string, string> = {}) => {
    let searchString = '';
    const keys = Object.keys(searchParams);
    if (keys.length > 0) {
        const params = keys
            .filter((key) => searchParams[key])
            .map((key) => `${key}=${searchParams[key]}`);
        searchString = '?' + params.join('&');
    }

    const cacheKey = `session-${sessionId}:req-searchAssets:checkups:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/search${searchString}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const updateCheckups = async (
    sessionId: string,
    checkupsId: string,
    name: string,
    description: string,
    tags: string[],
    version: string
) => {
    const body = {
        Name: name,
        Description: description,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    const result = await put(sessionId, url, body, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getCheckupsById-${checkupsId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};

export const deleteCheckups = async (sessionId: string, checkupsId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/checkups/${checkupsId}`;
    const result = await del(sessionId, url, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getCheckupsById-${checkupsId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};
