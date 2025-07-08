import { BACKEND_API_URL } from '$env/static/private';
import { ServerHelper } from '$lib/server/server.helper';
import { API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { del, get, post, put } from '../common.reancare';
import { SessionManager } from '../../../cache/session/session.manager';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createAssessmentTemplate = async (
	sessionId: string,
	title: string,
	description: string,
	type: string,
	provider: string,
	providerAssessmentCode: string,
	serveListNodeChildrenAtOnce: boolean,
	scoringApplicable: boolean,
	tags: string[]
) => {
	const body = {
		Title: title,
		Description: description ? description : '',
		Type: type,
		Provider: provider ? provider : '',
		ProviderAssessmentCode: providerAssessmentCode ? providerAssessmentCode : '',
		ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce ? serveListNodeChildrenAtOnce : false,
		ScoringApplicable: scoringApplicable ? scoringApplicable : false,
		Tags: tags ? tags : []
	};

	const url = BACKEND_API_URL + '/clinical/assessment-templates';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentTemplates`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const importAssessmentTemplate = async (
	sessionId: string,
	fileName: string,
	filePath: string,
	isPublic?: true
) => {
	const url = BACKEND_API_URL + '/clinical/assessment-templates/import-file';
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;
	const mimeType = ServerHelper.getMimeTypeFromFileName(fileName);
	console.log(`mimeType = ${mimeType}`);
	const form = new FormData();
	form.append("name", fs.createReadStream(filePath));
	form.append("IsPublicResource", isPublic ? "true" : "false");

	const headers = {
		'Content-Type': 'multipart/form-data',
		'x-api-key': API_CLIENT_INTERNAL_KEY,
		'Authorization': `Bearer ${accessToken}`,
	};

	try {
		const res = await axios.post(url, form, { headers });

		const response = res.data;

		const findAndClearKeys = [
			`session-${sessionId}:req-searchAssessmentTemplates`,
		];
		await DashboardManager.findAndClear(findAndClearKeys);

		return response;
	} catch (error) {
		//other than 201 status code
		return error.response.data;
	}

};

export const getAssessmentTemplateById = async (
	sessionId: string,
	assessmentTemplateId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}`;
	const cacheKey = `session-${sessionId}:req-getAssessmentTemplateById-${assessmentTemplateId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchAssessmentTemplates = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/clinical/assessment-templates/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchAssessmentTemplates:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateAssessmentTemplate = async (
	sessionId: string,
	assessmentTemplateId: string,
	title: string,
	description: string,
	type: string,
	provider: string,
	providerAssessmentCode: string,
	serveListNodeChildrenAtOnce: boolean,
	scoringApplicable: boolean,
	tags: string[]
) => {
	const body = {
		Title: title,
		Description: description ?? null,
		Type: type,
		Provider: provider ?? null,
		ProviderAssessmentCode: providerAssessmentCode ?? null,
		ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce ? serveListNodeChildrenAtOnce : false,
		ScoringApplicable: scoringApplicable ? scoringApplicable : false,
		Tags: tags ? tags : []
	};

	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentTemplateById-${assessmentTemplateId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentTemplates`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);
	return result;
};

export const deleteAssessmentTemplate = async (sessionId: string, assessmentTemplateId: string) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentTemplateById-${assessmentTemplateId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentTemplates`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
