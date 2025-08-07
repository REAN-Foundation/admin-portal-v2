import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.reancare';
import type { CAssessmentNodePath, CAssessmentPathCondition } from '$lib/types/assessment-path.types';

////////////////////////////////////////////////////////////////

export const createAssessmentPath = async (
	sessionId: string,
	templateId: string,
	pathData: CAssessmentNodePath
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths`;
	const result = await post(sessionId, url, pathData, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getAssessmentPathById = async (
	sessionId: string,
	templateId: string,
	pathId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}`;
	const cacheKey = `session-${sessionId}:req-getAssessmentPathById-${pathId}`;
	
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchAssessmentPaths = async (
	sessionId: string,
	templateId: string,
	searchParams?: any
) => {
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

	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchAssessmentPaths:${searchString}`;
	
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateAssessmentPath = async (
	sessionId: string,
	templateId: string,
	pathId: string,
	pathData: Partial<CAssessmentNodePath>
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}`;
	const result = await put(sessionId, url, pathData, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentPathById-${pathId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteAssessmentPath = async (
	sessionId: string,
	templateId: string,
	pathId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentPathById-${pathId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

// Set Next Node for Assessment Path
export const setAssessmentPathNextNode = async (
	sessionId: string,
	templateId: string,
	pathId: string,
	nextNodeId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}/set-next-node/${nextNodeId}`;
	const result = await put(sessionId, url, {}, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentPathById-${pathId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

// Remove Next Node from Assessment Path
export const removeAssessmentPathNextNode = async (
	sessionId: string,
	templateId: string,
	pathId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}/set-next-node/remove`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentPathById-${pathId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

// Condition Management
export const createAssessmentPathCondition = async (
	sessionId: string,
	templateId: string,
	pathId: string,
	conditionData: CAssessmentPathCondition
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}/conditions`;
	const result = await post(sessionId, url, conditionData, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPathConditions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const updateAssessmentPathCondition = async (
	sessionId: string,
	templateId: string,
	pathId: string,
	conditionId: string,
	conditionData: Partial<CAssessmentPathCondition>
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}/conditions/${conditionId}`;
	const result = await put(sessionId, url, conditionData, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPathConditions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteAssessmentPathCondition = async (
	sessionId: string,
	templateId: string,
	pathId: string,
	conditionId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/paths/${pathId}/conditions/${conditionId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentPathConditions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
}; 