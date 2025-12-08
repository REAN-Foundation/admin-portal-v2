import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put, del, post } from './common.reancare';
import type { TenantSettingsMarketingDomainModel, TenantMarketingQRCode } from '$lib/types/tenant.settings.types';
import { SessionManager } from '$routes/api/cache/session/session.manager';
import { error } from '@sveltejs/kit';

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
	settings: TenantSettingsMarketingDomainModel
) => {
	// Helper function to convert camelCase to PascalCase
	const toPascalCase = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	// Helper function to transform object keys from camelCase to PascalCase
	const transformToPascalCase = (obj: Record<string, unknown> | null | undefined): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			const pascalKey = toPascalCase(key);
			if (typeof value === 'string') {
				// Only include non-empty strings
				if (value.trim() !== '') {
					transformed[pascalKey] = value;
				}
			} else if (Array.isArray(value)) {
				// Filter empty strings from arrays and keep array as is
				const filteredArray = value.filter((item) => item && (typeof item === 'string' ? item.trim() !== '' : true));
				if (filteredArray.length > 0) {
					transformed[pascalKey] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				// Recursively transform nested objects
				const transformedNested = transformToPascalCase(value as Record<string, unknown>);
				// Only include nested object if it has at least one property
				if (transformedNested && Object.keys(transformedNested).length > 0) {
					transformed[pascalKey] = transformedNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				// Include other non-empty values
				transformed[pascalKey] = value;
			}
		}
		return Object.keys(transformed).length > 0 ? transformed : null;
	};

	// Helper function to filter out empty strings from objects (for Images and QRCode which are already PascalCase)
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
		const transformedStyling = transformToPascalCase(settings.Styling as Record<string, unknown>);
		if (transformedStyling) {
			body.Styling = transformedStyling;
		}
	}

	if (settings.Content) {
		const transformedContent = transformToPascalCase(settings.Content as Record<string, unknown>);
		if (transformedContent) {
			body.Content = transformedContent;
		}
	}

	if (settings.Images) {
		const filteredImages = filterEmptyStrings(settings.Images as Record<string, unknown>);
		if (filteredImages) {
			body.Images = filteredImages;
		}
	}

	if (settings.Logos !== undefined && settings.Logos !== null) {
		// Logos can be string[] or object or null
		if (Array.isArray(settings.Logos)) {
			const filteredLogos = settings.Logos.filter((logo) => logo && typeof logo === 'string' && logo.trim() !== '');
		if (filteredLogos.length > 0) {
			body.Logos = filteredLogos;
		}
		} else if (typeof settings.Logos === 'object') {
			body.Logos = settings.Logos;
		}
	}

	if (settings.QRCode !== undefined && settings.QRCode !== null) {
		// QRCode can be string, object, or null
		if (typeof settings.QRCode === 'string') {
			// If it's a string, use it as ResourceId
			body.QRCode = {
				ResourceId: settings.QRCode
			};
		} else if (typeof settings.QRCode === 'object' && !Array.isArray(settings.QRCode)) {
			// If it's an object, transform it
			const qrcode = settings.QRCode as Record<string, unknown>;
			const transformedQRcode: Record<string, unknown> = {};
			
			// Always include ResourceId if it exists and is not empty
			if (qrcode.ResourceId && typeof qrcode.ResourceId === 'string' && qrcode.ResourceId.trim() !== '') {
				transformedQRcode.ResourceId = qrcode.ResourceId;
			}
			
			// Only include QRCode if ResourceId is present (required for QR code image)
			if (transformedQRcode.ResourceId) {
				body.QRCode = transformedQRcode;
			}
		}
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
}

export const updateMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: TenantSettingsMarketingDomainModel
) => {
	// Helper function to convert camelCase to PascalCase
	const toPascalCase = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	// Helper function to transform object keys from camelCase to PascalCase
	const transformToPascalCase = (obj: Record<string, unknown> | null | undefined): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			const pascalKey = toPascalCase(key);
			if (typeof value === 'string') {
				// Only include non-empty strings
				if (value.trim() !== '') {
					transformed[pascalKey] = value;
				}
			} else if (Array.isArray(value)) {
				// Filter empty strings from arrays and keep array as is
				const filteredArray = value.filter((item) => item && (typeof item === 'string' ? item.trim() !== '' : true));
				if (filteredArray.length > 0) {
					transformed[pascalKey] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				// Recursively transform nested objects
				const transformedNested = transformToPascalCase(value as Record<string, unknown>);
				// Only include nested object if it has at least one property
				if (transformedNested && Object.keys(transformedNested).length > 0) {
					transformed[pascalKey] = transformedNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				// Include other non-empty values
				transformed[pascalKey] = value;
			}
		}
		return Object.keys(transformed).length > 0 ? transformed : null;
	};

	// Helper function to filter out empty strings from objects (for Images and QRCode which are already PascalCase)
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
		const transformedStyling = transformToPascalCase(settings.Styling as Record<string, unknown>);
		if (transformedStyling) {
			body.Styling = transformedStyling;
		}
	}

	if (settings.Content) {
		const transformedContent = transformToPascalCase(settings.Content as Record<string, unknown>);
		if (transformedContent) {
			body.Content = transformedContent;
		}
	}

	if (settings.Images) {
		const filteredImages = filterEmptyStrings(settings.Images as Record<string, unknown>);
		if (filteredImages) {
			body.Images = filteredImages;
		}
	}

	if (settings.Logos !== undefined && settings.Logos !== null) {
		// Logos can be string[] or object or null
		if (Array.isArray(settings.Logos)) {
			const filteredLogos = settings.Logos.filter((logo) => logo && typeof logo === 'string' && logo.trim() !== '');
		if (filteredLogos.length > 0) {
			body.Logos = filteredLogos;
		}
		} else if (typeof settings.Logos === 'object') {
			body.Logos = settings.Logos;
		}
	}

	if (settings.QRCode !== undefined && settings.QRCode !== null) {
		// QRCode can be string, object, or null
		if (typeof settings.QRCode === 'string') {
			// If it's a string, use it as ResourceId
			body.QRCode = {
				ResourceId: settings.QRCode
			};
		} else if (typeof settings.QRCode === 'object' && !Array.isArray(settings.QRCode)) {
			// If it's an object, transform it
			const qrcode = settings.QRCode as Record<string, unknown>;
			const transformedQRcode: Record<string, unknown> = {};
			
			// Always include ResourceId if it exists and is not empty
			if (qrcode.ResourceId && typeof qrcode.ResourceId === 'string' && qrcode.ResourceId.trim() !== '') {
				transformedQRcode.ResourceId = qrcode.ResourceId;
			}
			
			// Only include QRCode if ResourceId is present (required for QR code image)
			if (transformedQRcode.ResourceId) {
				body.QRCode = transformedQRcode;
			}
		}
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
}

export const downloadMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string
) => {
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}/download`;
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;

	const headers: Record<string, string> = {};
	headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
	headers['Authorization'] = `Bearer ${accessToken}`;
	headers['public'] = 'true';

	const res = await fetch(url, {
		method: 'GET',
		headers
	});

	const data = await res.arrayBuffer();

	if (data && res.ok) {
		const responseHeaders = res.headers;
		const contentType = responseHeaders.get('content-type') || 'application/octet-stream';
		
		let filename = `marketing-material-${tenantId}-${Date.now()}.pdf`;
		
		const disposition = responseHeaders.get('content-disposition');
		if (disposition) {
			const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1].replace(/['"]/g, '');
			}
		}

		return {
			success: true,
			Data: {
				Buffer: data,
				FileName: filename,
				MimeType: contentType
			}
		};
	} else {
		const response = await res.json();
		console.log(`Download response message: ${response.Message}`);
		throw error(response.HttpCode || 500, response.Message || 'Download failed');
	}
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
