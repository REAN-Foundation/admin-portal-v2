import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';
import { getTenantById } from '$routes/api/services/reancare/tenants';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    const tenantId = event.params.id;
    let chatbotSettings = undefined;
    let consentSettings = undefined;

    try {
        const tenantResponse = await getTenantById(sessionId, tenantId);
        if (tenantResponse.Status === 'failure' || tenantResponse.HttpCode !== 200) {
            throw error(tenantResponse.HttpCode, tenantResponse.Message);
        }
        const consentSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'Consent');
        if (consentSettingResponse.Status === 'failure' || consentSettingResponse.HttpCode !== 200) {
            throw error(consentSettingResponse.HttpCode, consentSettingResponse.Message);
        }
        const chatbotSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'ChatBot');
        if (chatbotSettingResponse.Status === 'failure' || chatbotSettingResponse.HttpCode !== 200) {
            throw error(chatbotSettingResponse.HttpCode, chatbotSettingResponse.Message);
        }
        if (chatbotSettingResponse.Data.TenantSettings) {
            chatbotSettings = chatbotSettingResponse.Data.TenantSettings.Consent;
        }
        if (consentSettingResponse.Data.TenantSettings) {
            consentSettings = consentSettingResponse.Data.TenantSettings;
        }

        return {
            tenantResponse,
            sessionId,
            tenantId,
            consentSettings,
            chatbotSettings
        };
    } catch (error) {
        console.error(`Error retrieving tenant consent settings: ${error.message}`);
    }
}