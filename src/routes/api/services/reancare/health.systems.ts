import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';
////////////////////////////////////////////////////////////////

export const createHealthSystem = async (
	sessionId: string,
	name: string,
	tags: string[]
) => {
	const body = {
		Name: name,
		Tags: tags ? tags : []
	};
	const url = BACKEND_API_URL + '/health-systems';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchHealthSystems`
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};

export const getHealthSystemById = async (sessionId: string, healthSystemId: string) => {
	const url = BACKEND_API_URL + `/health-systems/${healthSystemId}`;
    const cacheKey = `session-${sessionId}:req-getHealthSystemById-${healthSystemId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchHealthSystems = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/health-systems/search${searchString}`;
    const cacheKey = `session-${sessionId}:req-searchHealthSystems:${searchString}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const updateHealthSystem = async (
	sessionId: string,
	healthSystemId: string,
	name: string,
	tags: string[]
) => {
	const body = {
		healthSystemId,
		Name: name,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + `/health-systems/${healthSystemId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
    const keysToBeDeleted = [
        `session-${sessionId}:req-getHealthSystemById-${healthSystemId}`,
    ];
    await DashboardManager.deleteMany(keysToBeDeleted);
    const findAndClearKeys = [
        `session-${sessionId}:req-searchHealthSystems`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};

export const deleteHealthSystem = async (sessionId: string, healthSystemId: string) => {
	const url = BACKEND_API_URL + `/health-systems/${healthSystemId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

    const keysToBeDeleted = [
        `session-${sessionId}:req-getHealthSystemById-${healthSystemId}`,
    ];
    await DashboardManager.deleteMany(keysToBeDeleted);

    const findAndClearKeys = [
        `session-${sessionId}:req-searchHealthSystems`,
    ];
    await DashboardManager.findAndClear(findAndClearKeys);

    return result;
};

export const getHealthSystemsForTags = async (sessionId: string, tag: string) => {
    const url = BACKEND_API_URL + `/health-systems/by-tags/${tag}`;
    return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
