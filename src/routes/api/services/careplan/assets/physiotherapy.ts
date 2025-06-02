import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createPhysiotherapy = async (
    sessionId: string,
    name: string,
    description: string,
    recommendedDurationMin: number,
    tags: string[],
    version: string
) => {
    const body = {
        Name                  : name,
        Description           : description,
        RecommendedDurationMin: recommendedDurationMin,
        Tags                  : tags,
        Version               : !version || version?.length === 0 ? 'V 1.0' : version
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/physiotherapy';
    const result = await post(sessionId, url, body, true);

    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
    return result;
};

export const getPhysiotherapyById = async (sessionId: string, physiotherapyId: string) => {
    const cacheKey = `session-${sessionId}:req-getPhysiotherapyById-${physiotherapyId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/physiotherapy/${physiotherapyId}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchPhysiotherapy = async (sessionId: string, searchParams: Record<string, string> = {}) => {
    let searchString = '';
    const keys = Object.keys(searchParams);
    if (keys.length > 0) {
        const params = keys
            .filter((key) => searchParams[key])
            .map((key) => `${key}=${searchParams[key]}`);
        searchString = '?' + params.join('&');
    }

    const cacheKey = `session-${sessionId}:req-searchAssets:physiotherapy:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/physiotherapy/search${searchString}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const updatePhysiotherapy = async (
    sessionId: string,
    physiotherapyId: string,
    name: string,
    description: string,
    recommendedDurationMin: number,
    tags: string[],
    version: string
) => {
    const body = {
        Name                  : name,
        Description           : description,
        RecommendedDurationMin: recommendedDurationMin,
        Tags                  : tags,
        Version               : !version || version?.length === 0 ? 'V 1.0' : version
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/physiotherapy/${physiotherapyId}`;
    const result = await put(sessionId, url, body, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getPhysiotherapynById-${physiotherapyId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};

export const deletePhysiotherapy = async (sessionId: string, physiotherapyId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/physiotherapy/${physiotherapyId}`;
    const result = await del(sessionId, url, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getPhysiotherapyById-${physiotherapyId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};
