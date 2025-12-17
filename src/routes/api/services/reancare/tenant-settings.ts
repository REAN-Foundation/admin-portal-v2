import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put, del, post } from './common.reancare';
import type {
	TenantSettingsMarketingDomainModel,
	TenantMarketingQRCode
} from '$lib/types/tenant.settings.types';
import { SessionManager } from '$routes/api/cache/session/session.manager';
import { error } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////

const baseUrl = BACKEND_API_URL + '/tenant-settings';

////////////////////////////////////////////////////////////////

export const getTenantSettingsTypes = async (sessionId: string) => {
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
};

export const getTenantSettings = async (sessionId: string, tenantId: string) => {
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
	settings: any
) => {
	const url = baseUrl + `/${tenantId}/types/${type}`;
	console.log('This is setting from service', JSON.stringify(settings, null, 2));
	return await put(sessionId, url, settings, true, API_CLIENT_INTERNAL_KEY);
};

export const updateTenantSettings = async (
	sessionId: string,
	tenantId: string,
	settings: any,
	type?: string
) => {
	console.log('updateTenantSettings() get called....');
	const body = settings;
	console.log('settings update...', JSON.stringify(settings, null, 2));
	const url = type ? baseUrl + `/${tenantId}/types/${type}` : baseUrl + `/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteTenantSettings = async (sessionId: string, tenantId: string, type: string) => {
	const url = baseUrl + `/${tenantId}/types/${type}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getMarketingMaterialByTenantId = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const createMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: TenantSettingsMarketingDomainModel
) => {
	const toPascalCase = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const transformToPascalCase = (
		obj: Record<string, unknown> | null | undefined
	): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			const pascalKey = toPascalCase(key);
			if (typeof value === 'string') {
				if (value.trim() !== '') {
					transformed[pascalKey] = value;
				}
			} else if (Array.isArray(value)) {
				const filteredArray = value.filter(
					(item) => item && (typeof item === 'string' ? item.trim() !== '' : true)
				);
				if (filteredArray.length > 0) {
					transformed[pascalKey] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				const transformedNested = transformToPascalCase(value as Record<string, unknown>);
				if (transformedNested && Object.keys(transformedNested).length > 0) {
					transformed[pascalKey] = transformedNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				transformed[pascalKey] = value;
			}
		}
		return Object.keys(transformed).length > 0 ? transformed : null;
	};

	const filterEmptyStrings = (
		obj: Record<string, unknown> | null | undefined
	): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const filtered: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				if (value.trim() !== '') {
					filtered[key] = value;
				}
			} else if (Array.isArray(value)) {
				const filteredArray = value.filter(
					(item) => item && typeof item === 'string' && item.trim() !== ''
				);
				if (filteredArray.length > 0) {
					filtered[key] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				const filteredNested = filterEmptyStrings(value as Record<string, unknown>);

				if (filteredNested && Object.keys(filteredNested).length > 0) {
					filtered[key] = filteredNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
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
		if (Array.isArray(settings.Logos)) {
			const filteredLogos = settings.Logos.filter(
				(logo) => logo && typeof logo === 'string' && logo.trim() !== ''
			);
			if (filteredLogos.length > 0) {
				body.Logos = filteredLogos;
			}
		} else if (typeof settings.Logos === 'object') {
			body.Logos = settings.Logos;
		}
	}

	if (settings.QRCode !== undefined && settings.QRCode !== null) {
		if (typeof settings.QRCode === 'string') {
			body.QRCode = {
				ResourceId: settings.QRCode
			};
		} else if (typeof settings.QRCode === 'object' && !Array.isArray(settings.QRCode)) {
			const qrcode = settings.QRCode as Record<string, unknown>;
			const transformedQRcode: Record<string, unknown> = {};

			if (
				qrcode.ResourceId &&
				typeof qrcode.ResourceId === 'string' &&
				qrcode.ResourceId.trim() !== ''
			) {
				transformedQRcode.ResourceId = qrcode.ResourceId;
			}

			if (transformedQRcode.ResourceId) {
				body.QRCode = transformedQRcode;
			}
		}
	}

	// Add PageView if provided
	if (settings.PageView !== undefined && (settings.PageView === 1 || settings.PageView === 2)) {
		body.PageView = settings.PageView;
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const updateMarketingMaterialByTenantId = async (
	sessionId: string,
	tenantId: string,
	settings: TenantSettingsMarketingDomainModel
) => {
	const toPascalCase = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	const transformToPascalCase = (
		obj: Record<string, unknown> | null | undefined
	): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			const pascalKey = toPascalCase(key);
			if (typeof value === 'string') {
				if (value.trim() !== '') {
					transformed[pascalKey] = value;
				}
			} else if (Array.isArray(value)) {
				const filteredArray = value.filter(
					(item) => item && (typeof item === 'string' ? item.trim() !== '' : true)
				);
				if (filteredArray.length > 0) {
					transformed[pascalKey] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				const transformedNested = transformToPascalCase(value as Record<string, unknown>);

				if (transformedNested && Object.keys(transformedNested).length > 0) {
					transformed[pascalKey] = transformedNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
				transformed[pascalKey] = value;
			}
		}
		return Object.keys(transformed).length > 0 ? transformed : null;
	};

	const filterEmptyStrings = (
		obj: Record<string, unknown> | null | undefined
	): Record<string, unknown> | null => {
		if (!obj || typeof obj !== 'object') return null;
		const filtered: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'string') {
				if (value.trim() !== '') {
					filtered[key] = value;
				}
			} else if (Array.isArray(value)) {
				const filteredArray = value.filter(
					(item) => item && typeof item === 'string' && item.trim() !== ''
				);
				if (filteredArray.length > 0) {
					filtered[key] = filteredArray;
				}
			} else if (typeof value === 'object' && value !== null) {
				const filteredNested = filterEmptyStrings(value as Record<string, unknown>);
				if (filteredNested && Object.keys(filteredNested).length > 0) {
					filtered[key] = filteredNested;
				}
			} else if (value !== '' && value !== null && value !== undefined) {
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
		if (Array.isArray(settings.Logos)) {
			const filteredLogos = settings.Logos.filter(
				(logo) => logo && typeof logo === 'string' && logo.trim() !== ''
			);
			if (filteredLogos.length > 0) {
				body.Logos = filteredLogos;
			}
		} else if (typeof settings.Logos === 'object') {
			body.Logos = settings.Logos;
		}
	}

	if (settings.QRCode !== undefined && settings.QRCode !== null) {
		if (typeof settings.QRCode === 'string') {
			body.QRCode = {
				ResourceId: settings.QRCode
			};
		} else if (typeof settings.QRCode === 'object' && !Array.isArray(settings.QRCode)) {
			const qrcode = settings.QRCode as Record<string, unknown>;
			const transformedQRcode: Record<string, unknown> = {};

			if (
				qrcode.ResourceId &&
				typeof qrcode.ResourceId === 'string' &&
				qrcode.ResourceId.trim() !== ''
			) {
				transformedQRcode.ResourceId = qrcode.ResourceId;
			}

			if (transformedQRcode.ResourceId) {
				body.QRCode = transformedQRcode;
			}
		}
	}

	// Add PageView if provided
	if (settings.PageView !== undefined && (settings.PageView === 1 || settings.PageView === 2)) {
		body.PageView = settings.PageView;
	}

	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const downloadMarketingMaterialByTenantId = async (sessionId: string, tenantId: string) => {
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

	if (!res.ok) {
		// Read error response as text first, then try to parse as JSON
		const errorText = await res.text();
		let errorResponse;
		try {
			errorResponse = JSON.parse(errorText);
		} catch {
			errorResponse = { Message: errorText || 'Download failed', HttpCode: res.status };
		}
		console.log(`Download response message: ${errorResponse.Message}`);
		throw error(errorResponse.HttpCode || res.status || 500, errorResponse.Message || 'Download failed');
	}

	// Read the response body as arrayBuffer only if response is OK
	const data = await res.arrayBuffer();

	if (data) {
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
	}

	throw error(500, 'Download failed: No data received');
};
