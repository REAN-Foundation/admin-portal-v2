import { BOT_CONTENT_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { post } from '../reancare/common.reancare';

export const qnaDocumentPromotion = async (
	sessionId: string,
	qnaId: string,
	targetEnvironment: string,
	tenantCode: string
) => {
	const body = {
		TargetEnvironment: targetEnvironment,
		TenantCode: tenantCode
	};
	const url = BOT_CONTENT_API_URL + `/qna-promotion/${qnaId}/promotion-from`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};
