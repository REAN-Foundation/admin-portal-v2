import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	const tenantId = event.params.id as string;
	let customSettings = undefined;
	const response = await getTenantSettingsByType(sessionId, tenantId, 'CustomSettings');
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	if (response.Data?.TenantSettings) {
		customSettings = response.Data.TenantSettings;
	}

	return {
		sessionId,
		tenantId,
		customSettings
	};
	
};

