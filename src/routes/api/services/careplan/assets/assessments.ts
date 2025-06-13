import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
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
) => {
    const body = {
        Name: name,
        Description: description,
        Template: template,
        // TemplateCode: templateCode,
        ReferenceTemplateCode: referenceTemplateCode,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
        TenantId: tenantId
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/assessments';
    return await post(sessionId, url, body, true);
};

export const getAssessmentById = async (sessionId: string, assessmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    return await get(sessionId, url, true);
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
sessionId: string, assessmentId: string, name: string, description: string, template: string, referenceTemplateCode: string, tags: string[], version: string, tenantId: string) => {
    const body = {
        Name: name,
        Description: description,
        Template: template,
        ReferenceTemplateCode: referenceTemplateCode,
        Tags: tags,
        TenantId: tenantId,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    return await put(sessionId, url, body, true);
};

export const deleteAssessment = async (sessionId: string, assessmentId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/assessments/${assessmentId}`;
    return await del(sessionId, url, true);
};

// export const getAllAssessmentTemplates = async (sessionId: string) => {
//     const url = CAREPLAN_BACKEND_API_URL + '/assets/templates';
//     return await get(sessionId, url, true);
// };
