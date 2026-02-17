import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { post } from './common.reancare';

export const careplanPromotion = async (
	sessionId: string,
	careplanId: string,
	targetEnvironment: string,
    tenantCode: string
) => {
	const body = {
		TargetEnvironment: targetEnvironment,
        TenantCode: tenantCode
	};
	const url = CAREPLAN_BACKEND_API_URL + `/promotion/${careplanId}/promotion-from`;
	return await post(sessionId, url, body, true);
};
