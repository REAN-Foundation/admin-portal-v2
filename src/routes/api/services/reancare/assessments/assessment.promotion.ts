import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { post } from '../common.reancare';

export const assessmentPromotion = async (
	sessionId: string,
	assessmentTemplateId: string,
	targetEnvironment: string
) => {
	const body = {
		TargetEnvironment: targetEnvironment
	};
	const url = BACKEND_API_URL + `/clinical/assessment-templates/${assessmentTemplateId}/promote-from`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};
