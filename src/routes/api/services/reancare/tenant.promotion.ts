import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY} from '$env/static/private';
import { post } from './common.reancare';

export const promotion = async (
	sessionId: string,
    tenantId: string,
    targetEnvironment: string
) => {
    const body = {
        TargetEnvironment : targetEnvironment
    }
	const url = BACKEND_API_URL + `/tenants/${tenantId}/promotion-from`;
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};
