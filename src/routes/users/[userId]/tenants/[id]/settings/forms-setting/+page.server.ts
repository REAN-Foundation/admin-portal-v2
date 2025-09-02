import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    const tenantId = event.params.id as string;
    let settings = undefined;
    let commonSettings = undefined;

    try {

        const response = await getTenantSettingsByType(sessionId, tenantId, 'Forms');
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

        const isFormsEnabled = commonSettings?.UserInterfaces?.Forms;

        return {
            sessionId,
            tenantId,
            settings,
            commonSettings,
            isFormsEnabled
        };

    } catch (error) {
        console.error(`Error retriving tenant settings: ${error.message}`);
    }
};
