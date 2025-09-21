import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
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
    metaData?: any,
) => {
    const body = {
        Name: name,
        Description: description,
        Template: template,
        // TemplateCode: templateCode,
        ReferenceTemplateCode: referenceTemplateCode,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
        TenantId: tenantId,
        MetaData: metaData
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
sessionId: string, assessmentId: string, name: string, description: string, template: string, referenceTemplateCode: string, tags: string[], version: string, tenantId: string, metaData?: any) => {
    const body = {
        Name: name,
        Description: description,
        Template: template,
        ReferenceTemplateCode: referenceTemplateCode,
        Tags: tags,
        TenantId: tenantId,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
        MetaData: metaData
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
