import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';

///////////////////////////////////////////////////////////////////////////////
export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantId = event.locals.sessionUser.tenantId;
	let settings = undefined;

	const followupSettings = await getTenantSettingsByType(sessionId, tenantId, 'Followup');
	if (followupSettings.Status === 'failure' || followupSettings.HttpCode !== 200) {
		throw error(followupSettings.HttpCode, followupSettings.Message);
	}
	if (followupSettings.Data.TenantSettings) {
		settings = followupSettings.Data.TenantSettings;
	}

	const commonSettings = await getTenantSettingsByType(sessionId, tenantId, 'Common');
	const isFollowupEnabled = commonSettings?.Data?.TenantSettings?.UserInterfaces?.Followup ?? false;

	return {
		settings,
		tenantId,
		isFollowupEnabled,
		title: ''
	};
};
