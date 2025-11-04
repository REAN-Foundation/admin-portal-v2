import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import type { Metadata } from '$lib/types/assessments.type';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createAssessment = async (
    sessionId: string,
    name: string,
    description: string,
    template: string,
    referenceTemplateCode: string,
    tags: string[],
    version: string,
    tenantId: string,
    metadata?: Metadata,
) => {
    const body = {
        Name: name,
        Description: description ? description : null,
        Template: template ? template : null,
        // TemplateCode: templateCode,
        ReferenceTemplateCode: referenceTemplateCode ? referenceTemplateCode : null,
        Tags: tags ? tags : null,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
        TenantId: tenantId,
        Metadata: metadata ? metadata : null
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/assessments';
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
    return await post(sessionId, url, body, true);
};

export const getAssessmentById = async (sessionId: string, assessmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    const cacheKey = `session-${sessionId}:req-getAssessmentById-${assessmentId}`;
    if (await DashboardManager.has(cacheKey)) {
        return await DashboardManager.get(cacheKey);
    }
    const result = await get(sessionId, url, true);
    await DashboardManager.set(cacheKey, result);
    return result;
};

export const searchAssessment = async (sessionId: string, searchParams) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/search${searchString}`;
    return await get(sessionId, url, true);
};

export const updateAssessment = async (
    sessionId: string, assessmentId: string, name: string, description: string, template: string, referenceTemplateCode: string, tags: string[], version: string, tenantId: string, metadata?: Metadata) => {
    const body = {
        Name: name,
        Description: description ? description : null,
        Template: template ? template : null,
        ReferenceTemplateCode: referenceTemplateCode,
        Tags: tags ? tags : null,
        TenantId: tenantId,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
        Metadata: metadata ? metadata : null
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    const result = await put(sessionId, url, body, true);
    await DashboardManager.deleteMany([`session-${sessionId}:req-getAssessmentById-${assessmentId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
    return result;

};

export const deleteAssessment = async (sessionId: string, assessmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    const result = await del(sessionId, url, true);
    await DashboardManager.deleteMany([`session-${sessionId}:req-getAssessmentById-${assessmentId}`]);
    await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
    return result;
};

// export const getAllAssessmentTemplates = async (sessionId: string) => {
//     const url = CAREPLAN_BACKEND_API_URL + '/assets/templates';
//     return await get(sessionId, url, true);
// };
