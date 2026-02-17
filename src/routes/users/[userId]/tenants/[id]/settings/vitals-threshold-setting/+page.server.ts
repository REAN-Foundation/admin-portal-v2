import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';
import type { VitalsThresholds } from '$lib/types/tenant.settings.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	const tenantId = event.params.id as string;
	let vitalsThresholds: VitalsThresholds | undefined = undefined;
	const response = await getTenantSettingsByType(sessionId, tenantId, 'VitalsThresholds');
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	if (response.Data?.TenantSettings) {
		const settings = response.Data.TenantSettings;
		// Handle both cases: API may return flat vitals or wrapped under VitalsThresholds key
		if (settings.VitalsThresholds) {
			vitalsThresholds = settings.VitalsThresholds as VitalsThresholds;
		} else {
			vitalsThresholds = settings as VitalsThresholds;
		}
	}

	return {
		sessionId,
		tenantId,
		vitalsThresholds
	};
};
