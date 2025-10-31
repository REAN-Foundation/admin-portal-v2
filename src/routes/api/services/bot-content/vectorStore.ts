import { BOT_CONTENT_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../common';

//////////////////////////////////////////////////////////

export const createVector = async (
    sessionId: string,
    fileResourceId: string,
    tenantId: string,
    version : number
   
) => {
    const body = {
        id: fileResourceId,
        TenantId: tenantId ? tenantId : null,
        Version : version ? version : null
    };
    console.log("body ==>", body);
    
    const url = BOT_CONTENT_API_URL + `/vectorstore/${fileResourceId}`;
    console.log("url", url);
    
    return await post_(url,body,true, sessionId);
};

export const vectorStorePublish = async (
    sessionId: string,
    tenantId: string,
    version : number
   
) => {
    const body = {
        TenantId: tenantId ? tenantId : null,
        Version : version ? version : 1
    };
    console.log("body ==>", body);
    
    const url = BOT_CONTENT_API_URL + `/vectorstore/`;
    console.log("url", url);
    
    return await post_(url,body,true, sessionId);
};

export const vectorStoreRefresh = async (
    sessionId: string,
    tenantId: string,
) => {
    const body = {
        TenantId: tenantId ? tenantId : null
    };
    console.log("body ==>", body);
    
    const url = BOT_CONTENT_API_URL + `/vectorstore/refresh`;
    console.log("url", url);
    
    return await post_(url,body,true, sessionId);
};