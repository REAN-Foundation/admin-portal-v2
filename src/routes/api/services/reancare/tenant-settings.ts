import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put } from './common.reancare';

////////////////////////////////////////////////////////////////

const baseUrl = BACKEND_API_URL + '/tenant-settings';

////////////////////////////////////////////////////////////////

export const getTenantSettingsTypes = async (
	sessionId: string
	) => {
	const url = baseUrl + `/types`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getTenantSettingsByType = async (
	sessionId: string,
	tenantId: string,
	type: string
	) => {
	const url = baseUrl + `/${tenantId}/types/${type}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
}

export const getTenantSettings = async (
	sessionId: string,
	tenantId: string
	) => {
	const url = baseUrl + `/${tenantId}`;
    // const cacheKey = `session-${sessionId}:req-getTenantSettingsByTenantId-${tenantId}`;
	// if (await DashboardManager.has(cacheKey)) {
    //         return await DashboardManager.get(cacheKey);
    //     }
    const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
    // await DashboardManager.set(cacheKey, result);
    return result;
};

export const updateTenantSettingsByType = async (
	sessionId: string,
	tenantId: string,
	type: string,
	settings: any,
	) => {
	const url = baseUrl + `/${tenantId}/types/${type}`;
	return await put(sessionId, url, settings, true, API_CLIENT_INTERNAL_KEY);
}

export const updateTenantSettings = async (
    sessionId: string,
	tenantId: string,
    settings: any,
    ) => {
        console.log('updateTenantSettings() get called....');
        const body = settings;
		console.log("settings update...",JSON.stringify(settings,null,2));
	const url = baseUrl + `/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};
