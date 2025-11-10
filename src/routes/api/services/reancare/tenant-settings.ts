import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put, del, post } from './common.reancare';

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
	console.log("This is setting from service", JSON.stringify(settings, null, 2));
	return await put(sessionId, url, settings, true, API_CLIENT_INTERNAL_KEY);
}

export const updateTenantSettings = async (
	sessionId: string,
	tenantId: string,
	settings: any,
	type?: string
) => {
	console.log('updateTenantSettings() get called....');
	const body = settings;
	console.log("settings update...", JSON.stringify(settings, null, 2));
	const url = type ? baseUrl + `/${tenantId}/types/${type}` : baseUrl + `/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteTenantSettings = async (
	sessionId: string,
	tenantId: string,
	type: string
) => {
	const url = baseUrl + `/${tenantId}/types/${type}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};


export const getMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string
) => {
	const url = baseUrl + `/tenant-settings-marketing/${tenantId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
}

export const createMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: any
) => {
	const url = baseUrl + `/tenant-settings-marketing/${tenantId}`;
	return await post(sessionId, url, settings, true, API_CLIENT_INTERNAL_KEY);
}

// export const uploadMarketingMaterialLogo = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/logo`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialQrCode = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/qrcode`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialFeatureLogo = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/feature-logo`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialPrimaryLogo = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/primary-logo`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialSecondaryLogo = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/secondary-logo`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialReanLogo = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/rean-logo`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialHeroImage = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/hero-image`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const uploadMarketingMaterialPhoneMockup = async (
// 	sessionId: string,
// 	tenantId: string,
// 	file: File
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/phone-mockup`;
// 	const formData = new FormData();
// 	formData.append('file', file);

// 	return await post(sessionId, url, formData, true, API_CLIENT_INTERNAL_KEY);
// };

// export const exportMarketingMaterialSettings = async (
// 	sessionId: string,
// 	tenantId: string
// ) => {
// 	const url = baseUrl + `/${tenantId}/MarketingMaterial/export`;
// 	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
// };
