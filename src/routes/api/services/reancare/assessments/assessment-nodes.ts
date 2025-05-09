import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from '../common.reancare';
// import { del, get, post, put } from '../../rean-care/common.reancare';

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
	correctAnswer?: string
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
		Sequence:sequence,
		Tags: tags ? tags : [],
		CorrectAnswer: correctAnswer ? correctAnswer : null
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

	console.log('body----------',body);
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getAssessmentNodeById = async (
	sessionId: string,
	templateId: string,
	nodeId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	correctAnswer?: string

) => {
	const body = {
		NodeType: nodeType,
		Title: title,
		Description: description ? description : null,
		Message: message ? message : null,
		QueryResponseType: queryType,
		Options: options,
		Sequence: sequence,
		ServeListNodeChildrenAtOnce:serveListNodeChildrenAtOnce,
		Tags: tags ? tags : [],
		CorrectAnswer: correctAnswer ? correctAnswer : null

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
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteAssessmentNode = async (
	sessionId: string,
	templateId: string,
	nodeId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const addOption = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	text: string,
	sequence?: number,
) => {
	const body = {
		Text: text,
		Sequence:sequence,
	};
	console.log('body----------',body);
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const updateOption = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string,
	text: string,
	sequence?: number,
) => {
	const body = {
		Text: text,
		Sequence:sequence,
	};
	console.log('body----------',body);
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteOption = async (sessionId: string, templateId: string, nodeId: string, optionId: string) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};