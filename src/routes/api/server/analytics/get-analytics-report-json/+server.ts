import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import { getAnalyticsReport } from '../../../services/user-analytics/user-analytics';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    let response;
	try {
		const explicitTenantCode = event.url.searchParams.get('tenantCode');
		const roleName = event.locals.sessionUser?.roleName;
		const isSystemAdmin = roleName === 'System admin' || roleName === 'System user';
		const tenantCode = (isSystemAdmin && explicitTenantCode) ? explicitTenantCode : event.locals.sessionUser?.tenantCode;
        response = await getAnalyticsReport('json', tenantCode);
	} catch (error) {
		console.error(`Error downloading analytics report: ${error}`);
        throw redirect(
			errorMessage('Error in downloading.'), 
			event
			);
        }
	
    if(response===null){
		throw redirect(
			errorMessage('Analytics report is not available!.'), 
			event
			);
	}
    return response;
};
