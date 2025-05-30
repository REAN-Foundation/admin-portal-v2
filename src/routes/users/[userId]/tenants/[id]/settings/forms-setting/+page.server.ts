import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '../../../../../../api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    let settings = undefined;
    event.depends('app:tenant-settings:forms');
    try {
        const tenantId = event.params.id as string;
        const response = await getTenantSettingsByType(sessionId, tenantId, 'Forms');

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
