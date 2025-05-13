import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createMessage = async (
    sessionId: string,
    name: string,
    description: string,
    messageType: string,
    templateName: string,
    pathUrl: string,
    tags: string[],
    version: string 
) => {
    const body = {
        Name: name,
        Description: description,
        MessageType: messageType,
        TemplateName: templateName,
        Url: pathUrl,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + '/assets/messages';
    return await post(sessionId, url, body, true);
};

export const getMessageById = async (sessionId: string, messageId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
    return await get(sessionId, url, true);
};

export const searchMessages = async (sessionId: string, searchParams) => {
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
    const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/search${searchString}`;
    return await get(sessionId, url, true);
};

export const updateMessage = async (
sessionId: string, messageId: string, name: string, description: string, messageType: string, templateName: string, pathUrl: string, tags: string[], version: string) => {
    const body = {
        Name: name,
        Description: description,
        MessageType: messageType,
        TemplateName: templateName,
        Url: pathUrl,
        Tags: tags,
        Version: !version || version?.length === 0 ? 'V 1.0' : version,
    };

    const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
    return await put(sessionId, url, body, true);
};

export const deleteMessage = async (sessionId: string, messageId: string) => {
    const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
    return await del(sessionId, url, true);
};
