import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.reancare';
import type { AssessmentPathUpdateModel } from '$lib/types/assessment-path.types';

export const createAssessmentPath = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	messageBeforeQuestion: string | undefined,
	isExitPath: boolean,
	nextNodeId: string,
	nextNodeDisplayCode: string | undefined
) => {

	const pathData = {
		// TemplateId: templateId,
		// NodeId: nodeId,
		MessageBeforeQuestion: messageBeforeQuestion,
		IsExitPath: isExitPath,
		NextNodeId: nextNodeId,
		NextNodeDisplayCode: nextNodeDisplayCode
	};
    console.log('pathData', pathData);
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/paths`;
	console.log('url', url);
	const result = await post(sessionId, url, pathData, true, API_CLIENT_INTERNAL_KEY);

	// Clear relevant cache
	const findAndClearKeys = [
		`session-${sessionId}:req-getAssessmentNodeById-${nodeId}`,
		`session-${sessionId}:req-searchAssessmentNodes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const updateAssessmentPath = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string,
	pathId: string,
	pathData: AssessmentPathUpdateModel
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}/paths/${pathId}`;
	const result = await put(sessionId, url, pathData, true, API_CLIENT_INTERNAL_KEY);

	// Clear relevant cache
	const findAndClearKeys = [
		`session-${sessionId}:req-getAssessmentNodeById-${nodeId}`,
		`session-${sessionId}:req-searchAssessmentNodes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteAssessmentPath = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string,
	pathId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}/paths/${pathId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	// Clear relevant cache
	const findAndClearKeys = [
		`session-${sessionId}:req-getAssessmentNodeById-${nodeId}`,
		`session-${sessionId}:req-searchAssessmentNodes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getAssessmentPaths = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/options/${optionId}/paths`;
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	return result;
};

export const getAssessmentPathById = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	optionId: string,
	pathId: string
) => {
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/paths/${pathId}`;
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	return result;
}; 