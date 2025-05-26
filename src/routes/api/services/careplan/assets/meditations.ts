import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createMeditation = async (
    sessionId: string,
    name: string,
    description: string,
    meditationType: string,
    recommendedDurationMin: number,
    tags: string[],
    version: string
) => {
    const body = {
        Name                  : name,
        Description           : description,
        MeditationType        : meditationType,
        RecommendedDurationMin: recommendedDurationMin,
        Tags                  : tags,
        Version               : !version || version?.length === 0 ? 'V 1.0' : version
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/meditations';
    const result = await post(sessionId, url, body, true);

    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
    return result;
};

export const getMeditationById = async (sessionId: string, meditationId: string) => {
    const cacheKey = `session-${sessionId}:req-getMeditationById-${meditationId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/meditations/${meditationId}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchMeditations = async (sessionId: string, searchParams: Record<string, string> = {}) => {
    let searchString = '';
    const keys = Object.keys(searchParams);
    if (keys.length > 0) {
        const params = keys
            .filter((key) => searchParams[key])
            .map((key) => `${key}=${searchParams[key]}`);
        searchString = '?' + params.join('&');
    }

    const cacheKey = `session-${sessionId}:req-searchAssets:meditations:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

    const url = CAREPLAN_BACKEND_API_URL + `/assets/meditations/search${searchString}`;
    const result = await get(sessionId, url, true);

    await DashboardManager.set(cacheKey, result);
    return result;
};

export const updateMeditation = async (
    sessionId: string,
    meditationId: string,
    name: string,
    description: string,
    meditationType: string,
    recommendedDurationMin: number,
    tags: string[],
    version: string
) => {
    const body = {
        Name                  : name,
        Description           : description,
        MeditationType          : meditationType,
        RecommendedDurationMin: recommendedDurationMin,
        Tags                  : tags,
        Version               : !version || version?.length === 0 ? 'V 1.0' : version
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/meditations/${meditationId}`;
    const result = await put(sessionId, url, body, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getMeditationById-${meditationId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};

export const deleteMeditation = async (sessionId: string, meditationId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/meditations/${meditationId}`;
    const result = await del(sessionId, url, true);

    await DashboardManager.deleteMany([`session-${sessionId}:req-getMeditationById-${meditationId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

    return result;
};
