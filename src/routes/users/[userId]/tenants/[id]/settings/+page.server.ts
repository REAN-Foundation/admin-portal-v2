import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettings, getTenantSettingsByType } from '../../../../../api/services/reancare/tenant-settings';
import type { CommonSettings } from '$lib/types/tenant.settings.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	let commonSettings = undefined;
	let followupSettings = undefined;
    const tenantId = event.params.id as string;
    const response = await getTenantSettings(sessionId, tenantId);
    console.log('response**', response);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }

    if (response.Data?.TenantSettings) {
        commonSettings = response.Data.TenantSettings.Common as CommonSettings;
    }

    // Load follow-up settings
    const followupResponse = await getTenantSettingsByType(sessionId, tenantId, 'Followup');
    if (followupResponse.Status === 'success' && followupResponse.HttpCode === 200) {
        followupSettings = followupResponse.Data?.TenantSettings;
    }

    const isFollowupEnabled = commonSettings?.UserInterfaces?.Followup;

    return {
        sessionId,
        tenantId,
        commonSettings,
        followupSettings,
        isFollowupEnabled
    };

};
