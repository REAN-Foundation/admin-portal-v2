import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.reancare';

////////////////////////////////////////////////////////////////

export const createAssessmentNode = async (
	sessionId: string,
	templateId: string,
	parentNodeId: string,
	nodeType: string,
	title: string,
	description?: string,
	tags?: string[],
	message?: string,
	serveListNodeChildrenAtOnce?: boolean,
	queryType?: string,
	options?: string[],
	sequence?: number,
	correctAnswer?: number | boolean | string,
	rawData?: string,
	required?: boolean,
	scoringApplicable?: boolean,
	resolutionScore?: number,
	providerAssessmentCode?: string,
	fieldIdentifier?: string,
	fieldIdentifierUnit?: string
) => {
	const body = {
		ParentNodeId: parentNodeId,
		NodeType: nodeType,
		Title: title,
		Description: description ? description : null,
		Message: message ? message : null,
		ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
		QueryResponseType: queryType,
		Options: options,
		Sequence: sequence,
		Tags: tags ? tags : [],
		CorrectAnswer: correctAnswer ? correctAnswer : null,
		RawData: rawData ? JSON.parse(rawData) : null,
		Required: required ? required : false,
		ScoringApplicable: scoringApplicable ? scoringApplicable : false,
		ResolutionScore: resolutionScore ? resolutionScore : null,
		ProviderAssessmentCode: providerAssessmentCode ? providerAssessmentCode : null,
		FieldIdentifier: fieldIdentifier ? fieldIdentifier : null,
		FieldIdentifierUnit: fieldIdentifierUnit ? fieldIdentifierUnit : null
	};

	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes`;
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

		const findAndClearKeys = [
			`session-${sessionId}:req-searchAssessmentNodes`,
		];
		await DashboardManager.findAndClear(findAndClearKeys);
	
		return result;
};

export const getAssessmentNodeById = async (
	sessionId: string,
	templateId: string,
	nodeId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}`;
	// const cacheKey = `session-${sessionId}:req-getAssessmentNodeById-${nodeId}`;
	// if (await DashboardManager.has(cacheKey)) {
	// 	return await DashboardManager.get(cacheKey);
	// }
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	// await DashboardManager.set(cacheKey, result);
	return result;

	
};

export const searchAssessmentNodes = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/clinical/assessment-templates/nodes/search${searchString}`;
	// return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	const cacheKey = `session-${sessionId}:req-searchAssessmentNodes${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateAssessmentNode = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	nodeType: string,
	title: string,
	description: string,
	tags?: string[],
	queryType?: string,
	options?: string[],
	message?: string,
	sequence?: number,
	serveListNodeChildrenAtOnce?: boolean,
	correctAnswer?: number | boolean | string,
	rawData?: string,
	scoringApplicable?: boolean,
	resolutionScore?: number,
	providerAssessmentCode?: string,
	fieldIdentifier?: string,
	fieldIdentifierUnit?: string


) => {
	const body = {
		NodeType: nodeType,
		Title: title,
		Description: description ? description : null,
		Message: message ? message : null,
		QueryResponseType: queryType,
		Options: options,
		Sequence: sequence,
		ServeListNodeChildrenAtOnce: serveListNodeChildrenAtOnce,
		Tags: tags ? tags : [],
		CorrectAnswer: correctAnswer ? correctAnswer : null,
		RawData: rawData ? JSON.parse(rawData) : null,
		ScoringApplicable: scoringApplicable ? scoringApplicable : false,
		ResolutionScore: resolutionScore ? resolutionScore : null,
		ProviderAssessmentCode: providerAssessmentCode ? providerAssessmentCode : null,
		FieldIdentifier: fieldIdentifier ? fieldIdentifier : null,
		FieldIdentifierUnit: fieldIdentifierUnit ? fieldIdentifierUnit : null


	};
	if (options && options.length > 0) {
		let count = 1;
		const options = [];
		for (const o of body.Options) {
			const option = {
				Text: o,
				Sequence: count
			};
			options.push(option);
			count = count + 1;
		}
		body.Options = options;
	}
	console.log('body---', body)
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentNodeById-${nodeId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentNodes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteAssessmentNode = async (
	sessionId: string,
	templateId: string,
	nodeId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}`;
	
	let parentNodeId = null;
	try {
		const nodeResponse = await getAssessmentNodeById(sessionId, templateId, nodeId);
		if (nodeResponse.Status === 'success' && nodeResponse.Data?.AssessmentNode) {
			parentNodeId = nodeResponse.Data.AssessmentNode.ParentNodeId;
		}
	} catch {
		console.log('Could not get parent node ID, proceeding with deletion');
	}
	
	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentNodeById-${nodeId}`,
		`session-${sessionId}:req-getAssessmentTemplateById-${templateId}`	
	];
	
	if (parentNodeId) {
		keysToBeDeleted.push(`session-${sessionId}:req-getAssessmentNodeById-${parentNodeId}`);
	}

	console.log('keysToBeDeleted', keysToBeDeleted)
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentNodes`,
		`session-${sessionId}:req-searchAssessmentTemplates`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	return result;
};

export const getQueryResponseTypes = async (sessionId: string) => {
	const url = BACKEND_API_URL + `/types/query-response-types`;
	return await get(sessionId, url, false, API_CLIENT_INTERNAL_KEY);
};

export const addScoringCondition = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	resolutionScore: number
) => {
	const body = {
		NodeId: nodeId,
		ResolutionScore: resolutionScore
	};
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/scoring-conditions/`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getScoringCondition = async (
	sessionId: string,
	templateId: string,
	scoringConditionId: string
) => {
	const url =
		BACKEND_API_URL +
		`/clinical/assessment-templates/${templateId}/scoring-conditions/${scoringConditionId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateScoringCondition = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	scoringConditionId: string,
	resolutionScore: number
) => {
	const body = {
		NodeId: nodeId,
		ResolutionScore: resolutionScore
	};
	const url =
		BACKEND_API_URL +
		`/clinical/assessment-templates/${templateId}/scoring-conditions/${scoringConditionId}`;

	console.log('body----------', body);
	console.log('url----------', url);
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const addOption = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	text: string,
	sequence?: number,
	providerGivenCode?: string,
) => {
	const body = {
		Text: text,
		Sequence: sequence,
		ProviderGivenCode: providerGivenCode || text, // Always default to text if not provided
	};
	console.log('body----------', body);
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options`;
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentNodeOptions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const updateOption = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string,
	text: string,
	sequence?: number,
	providerGivenCode?: string,
) => {
	const body = {
		Text: text,
		Sequence: sequence,
		ProviderGivenCode: providerGivenCode || text, // Always default to text if not provided
	};

	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}`;

	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentNodeOptionsById-${optionId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentNodeOptions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getOption = async (
	sessionId: string,
	assessmentTemplateId: string,
	nodeId: string,
	optionId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}/nodes/${nodeId}/options/${optionId}`;
	// const cacheKey = `session-${sessionId}:req-getOption-${optionId}`;
	// if (await DashboardManager.has(cacheKey)) {
	// 	return await DashboardManager.get(cacheKey);
	// }
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	// await DashboardManager.set(cacheKey, result);
	return result;
};

export const deleteOption = async (sessionId: string, templateId: string, nodeId: string, optionId: string) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getAssessmentNodeOptionsById-${optionId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchAssessmentNodeOptions`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
