import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    const tenantId = event.locals?.sessionUser?.tenantId;
    const tenantCode = event.locals?.sessionUser?.tenantCode;
    const tenantName = event.locals?.sessionUser?.tenantName;
    let chatbotSettings = undefined;
    let consentSettings = undefined;

    try {
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

        console.log('Consent Settings:', consentSettings);
        return {
            tenantCode,
            tenantName,
            sessionId,
            tenantId,
            consentSettings,
            chatbotSettings
        };

    } catch (error) {
        console.error(`Error retrieving tenant consent settings: ${error.message}`);
    
    }

}