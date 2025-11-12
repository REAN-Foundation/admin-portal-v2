import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put, del, post } from './common.reancare';
import type { MarketingMaterialCreateModel, MarketingMaterialUpdateModel } from '$lib/types/tenant.settings.types';

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
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
}

export const createMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: MarketingMaterialCreateModel
) => {
	// Helper function to filter out empty strings from objects
	const filterEmptyStrings = (obj: Record<string, unknown> | null | undefined): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const filtered: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				// Only include non-empty strings
				if (value.trim() !== '') {
					filtered[key] = value;
				}
			} else if (Array.isArray(value)) {
				// Filter empty strings from arrays
				const filteredArray = value.filter((item) => item && typeof item === 'string' && item.trim() !== '');
				if (filteredArray.length > 0) {
					filtered[key] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				// Recursively filter nested objects
				const filteredNested = filterEmptyStrings(value as Record<string, unknown>);
				// Only include nested object if it has at least one property
				if (filteredNested && Object.keys(filteredNested).length > 0) {
					filtered[key] = filteredNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				// Include other non-empty values
				filtered[key] = value;
			}
		}
		return Object.keys(filtered).length > 0 ? filtered : null;
	};

	const body: Record<string, unknown> = {};

	if (settings.Styling) {
		const filteredStyling = filterEmptyStrings(settings.Styling as Record<string, unknown>);
		if (filteredStyling) {
			body.Styling = filteredStyling;
		}
	}

	if (settings.Content) {
		const filteredContent = filterEmptyStrings(settings.Content as Record<string, unknown>);
		if (filteredContent) {
			body.Content = filteredContent;
		}
	}

	if (settings.Images) {
		const filteredImages = filterEmptyStrings(settings.Images as Record<string, unknown>);
		if (filteredImages) {
			body.Images = filteredImages;
		}
	}

	if (settings.Logos && settings.Logos.length > 0) {
		const filteredLogos = settings.Logos.filter((logo) => logo && logo.trim() !== '');
		if (filteredLogos.length > 0) {
			body.Logos = filteredLogos;
		}
	}

	if (settings.QRcode) {
		const filteredQRcode = filterEmptyStrings(settings.QRcode as Record<string, unknown>);
		if (filteredQRcode) {
			body.QRcode = filteredQRcode;
		}
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
}

export const updateMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: MarketingMaterialUpdateModel
) => {
	// Helper function to filter out empty strings from objects
	const filterEmptyStrings = (obj: Record<string, unknown> | null | undefined): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const filtered: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				// Only include non-empty strings
				if (value.trim() !== '') {
					filtered[key] = value;
				}
			} else if (Array.isArray(value)) {
				// Filter empty strings from arrays
				const filteredArray = value.filter((item) => item && typeof item === 'string' && item.trim() !== '');
				if (filteredArray.length > 0) {
					filtered[key] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				// Recursively filter nested objects
				const filteredNested = filterEmptyStrings(value as Record<string, unknown>);
				// Only include nested object if it has at least one property
				if (filteredNested && Object.keys(filteredNested).length > 0) {
					filtered[key] = filteredNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				// Include other non-empty values
				filtered[key] = value;
			}
		}
		return Object.keys(filtered).length > 0 ? filtered : null;
	};

	const body: Record<string, unknown> = {};

	if (settings.Styling) {
		const filteredStyling = filterEmptyStrings(settings.Styling as Record<string, unknown>);
		if (filteredStyling) {
			body.Styling = filteredStyling;
		}
	}

	if (settings.Content) {
		const filteredContent = filterEmptyStrings(settings.Content as Record<string, unknown>);
		if (filteredContent) {
			body.Content = filteredContent;
		}
	}

	if (settings.Images) {
		const filteredImages = filterEmptyStrings(settings.Images as Record<string, unknown>);
		if (filteredImages) {
			body.Images = filteredImages;
		}
	}

	if (settings.Logos && settings.Logos.length > 0) {
		const filteredLogos = settings.Logos.filter((logo) => logo && logo.trim() !== '');
		if (filteredLogos.length > 0) {
			body.Logos = filteredLogos;
		}
	}

	if (settings.QRcode) {
		const filteredQRcode = filterEmptyStrings(settings.QRcode as Record<string, unknown>);
		if (filteredQRcode) {
			body.QRcode = filteredQRcode;
		}
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
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
