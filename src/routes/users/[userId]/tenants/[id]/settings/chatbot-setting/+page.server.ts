import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';
import { getTenantById } from '$routes/api/services/reancare/tenants';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId') as string;
    const tenantId = event.params.id as string;
    const defaultTenantCode = event.locals?.sessionUser?.tenantCode;
    const tenantName = event.locals?.sessionUser?.tenantName;

    let chatbotSettings = undefined;
    let consentSettings = undefined;
    let commonSettings = undefined;
    
    const chatbotSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'ChatBot');
    if (chatbotSettingResponse.Status === 'failure' || chatbotSettingResponse.HttpCode !== 200) {
        throw error(chatbotSettingResponse.HttpCode, chatbotSettingResponse.Message);
    }
    if (chatbotSettingResponse.Data.TenantSettings) {
        chatbotSettings = chatbotSettingResponse.Data.TenantSettings;
    }

    const consentSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'Consent');
    if (consentSettingResponse.Status === 'failure' || consentSettingResponse.HttpCode !== 200) {
        throw error(consentSettingResponse.HttpCode, consentSettingResponse.Message);
    }
    if (consentSettingResponse.Data.TenantSettings) {
        consentSettings = consentSettingResponse.Data.TenantSettings;
    }

    const commonSettingResponse = await getTenantSettingsByType(sessionId, tenantId, 'Common');
    if (commonSettingResponse.Status === 'failure' || commonSettingResponse.HttpCode !== 200) {
        throw error(commonSettingResponse.HttpCode, commonSettingResponse.Message);
    }
    if (commonSettingResponse.Data.TenantSettings) {
        commonSettings = commonSettingResponse.Data.TenantSettings;
    }
    let tenantCode = '';
    const tenantInfo = await getTenantById(sessionId, tenantId);
    if (tenantInfo.Status === 'failure' || tenantInfo.HttpCode !== 200) {
        throw error(tenantInfo.HttpCode, tenantInfo.Message);
    }
    if (tenantInfo.Data.Tenant) {
        tenantCode = tenantInfo.Data.Tenant.Code;
    }

    const isChatBotEnabled = commonSettings?.UserInterfaces?.ChatBot;
    return {
        defaultTenantCode,
        tenantCode,
        tenantName,
        sessionId,
        tenantId,
        chatbotSettings,
        consentSettings,
        commonSettings,
        isChatBotEnabled
    };

};
