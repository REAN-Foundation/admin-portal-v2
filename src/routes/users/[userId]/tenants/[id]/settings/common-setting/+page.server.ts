import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	const tenantId = event.locals?.sessionUser?.tenantId;
	let settings = undefined;

	try {

		const response = await getTenantSettingsByType(sessionId, tenantId, 'Common');
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		if (response.Data.TenantSettings) {
			settings = response.Data.TenantSettings;
		}

		return {
			sessionId,
			tenantId,
			settings
		};

	} catch (error) {
		console.error(`Error retriving tenant settings: ${error.message}`);
	}
};
