import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    const tenantId = event.locals?.sessionUser?.tenantId;

    let settings = undefined;
    let commonSettings = undefined;

    const response = await getTenantSettingsByType(sessionId, tenantId, 'Followup');

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    if (response.Data.TenantSettings) {
        settings = response.Data.TenantSettings;
    }

    const commonSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'Common');
    if (commonSettingResponse.Status === 'failure' || commonSettingResponse.HttpCode !== 200) {
        throw error(commonSettingResponse.HttpCode, commonSettingResponse.Message);
    }
    if (commonSettingResponse.Data.TenantSettings) {
        commonSettings = commonSettingResponse.Data.TenantSettings;
    }

    const isFollowupEnabled = commonSettings?.UserInterfaces?.Followup;

    return {
        sessionId,
        tenantId,
        settings,
        commonSettings,
        isFollowupEnabled
    };

};
