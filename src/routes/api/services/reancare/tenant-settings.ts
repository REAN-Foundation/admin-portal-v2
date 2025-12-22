import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { get, put, del, post } from './common.reancare';
import type {
	TenantSettingsMarketingDomainModel,
	TenantMarketingQRCode
} from '$lib/types/tenant.settings.types';
import { SessionManager } from '$routes/api/cache/session/session.manager';
import { error } from '@sveltejs/kit';
import { transformMarketingMaterialSettings } from '$lib/utils/marketing-material.helpers';

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

export const getMarketingMaterial = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const createMarketingMaterial = async (
	sessionId: string,
	tenantId: string,
	settings: TenantSettingsMarketingDomainModel
) => {
	const body = transformMarketingMaterialSettings(settings);
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const updateMarketingMaterial = async (
	sessionId: string,
	tenantId: string,
	settings: TenantSettingsMarketingDomainModel
) => {
	const body = transformMarketingMaterialSettings(settings);
	const url = BACKEND_API_URL + `/tenant-settings-marketing/${tenantId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const downloadMarketingMaterial = async (sessionId: string, tenantId: string) => {
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
