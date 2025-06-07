import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createConsultation = async (
	sessionId: string,
	name: string,
	description: string,
	consultationType: string,
	tags: string[],
	version: string,
	tenantId: string,
) => {
	const body = {
		Name            : name,
		Description     : description,
		ConsultationType: consultationType,
		Tags            : tags,
		TenantId        : tenantId,
		Version         : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/consultations';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getConsultationById = async (sessionId: string, consultationId: string) => {
	const cacheKey = `session-${sessionId}:req-getConsultationById-${consultationId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchConsultation = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:consultation:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateConsultation = async (
	sessionId: string,
	consultationId: string,
	name: string,
	description: string,
	consultationType: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name            : name,
		Description     : description,
		ConsultationType: consultationType,
		Tags            : tags,
		TenantId        : tenantId,
		Version         : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getConsultationById-${consultationId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteConsultation = async (sessionId: string, consultationId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getConsultationById-${consultationId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
