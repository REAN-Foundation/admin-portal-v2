import { API_CLIENT_INTERNAL_KEY, CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../../services/reancare/common.reancare';

////////////////////////////////////////////////////////////////

export const createCareplanCategory = async (
    sessionId: string,
    type: string,
    description: string,
    tenantId: string

) => {
    const body = {
        Type: type,
        Description: description?description:null,
        TenantId: tenantId
    }
    const url = CAREPLAN_BACKEND_API_URL + '/careplan-categories';
    const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchCareplanCategories`
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};

export const getCareplanCategoryById = async (sessionId: string, categoryId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/${categoryId}`;
    const cacheKey = `session-${sessionId}:req-getCareplanCategoryById-${categoryId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }
    const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchCareplanCategories = async (sessionId: string, searchParams?) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/search${searchString}`;
    const cacheKey = `session-${sessionId}:req-searchCareplanCategories:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }
    const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const updateCareplanCategory = async (
    sessionId: string,
    categoryId: string,
    type: string,
    description: string,
) => {
    const body = {
        Type: type,
        Description: description?description:null,
    }
    const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/${categoryId}`;
    const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
    const keysToBeDeleted = [
        `session-${sessionId}:req-getCareplanCategoryById-${categoryId}`,
    ];
    await DashboardManager.deleteMany(keysToBeDeleted);
    const findAndClearKeys = [
        `session-${sessionId}:req-searchCareplanCategories`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};

export const deleteCareplanCategory = async (sessionId: string, categoryId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/${categoryId}`;
    const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

    const keysToBeDeleted = [
        `session-${sessionId}:req-getCareplanCategoryById-${categoryId}`,
    ];
    await DashboardManager.deleteMany(keysToBeDeleted);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchCareplanCategories`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};
