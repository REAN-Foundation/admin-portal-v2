import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    let settings = undefined;
    try {
        console.log('Event-', event)
        const tenantId = event.locals?.sessionUser?.tenantId;
        const tenantCode = event.locals?.sessionUser?.tenantCode;
        const tenantName = event.locals?.sessionUser?.tenantName;
        const response = await getTenantSettingsByType(sessionId, tenantId, 'ChatBot');
        // console.log("response of setting", response);


        if (response.Status === 'failure' || response.HttpCode !== 200) {
            throw error(response.HttpCode, response.Message);
        }

        if (response.Data.TenantSettings) {
            settings = response.Data.TenantSettings;
        }

        console.log('response=', JSON.stringify(settings, null, 2));

        return {
            tenantCode,
            tenantName,
            sessionId,
            tenantId,
            settings
        };
    } catch (error) {
        console.error(`Error retriving tenant settings: ${error.message}`);
    }
};
