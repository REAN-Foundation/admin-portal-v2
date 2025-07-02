import { API_CLIENT_INTERNAL_KEY, BOT_CONTENT_API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { ServerHelper } from '$lib/server/server.helper';
import axios from 'axios';

import { SessionManager } from '$routes/api/cache/session/session.manager';
import { del, get } from '../reancare/common.reancare';

////////////////////////////////////////////////////////////////

export const uploadBinary = async (
    sessionId: string,
    tenantId: string,
    buffer: Buffer,
    filename: string,
    isPublic = true
) => {
    const url = BOT_CONTENT_API_URL + `/file-resources/upload`;
    const session = await SessionManager.getSession(sessionId);
    const accessToken = session.accessToken;

    const mimeType = ServerHelper.getMimeTypeFromFileName(filename);
    console.log(`mimeType = ${mimeType}`);

    const headers = {};
    headers['Content-Type'] = 'application/octet-stream';
    headers['x-file-name'] = filename;
    headers['public'] = isPublic ? 'true' : 'false';
    headers['TenantId'] = tenantId;
    headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
    headers['Authorization'] = `Bearer ${accessToken}`;
    headers['size'] = buffer.length.toString();

    const config = {
        method: 'post',
        url: url,
        headers: headers,
        data: buffer
    };

    const res = await axios(config);
    const response = res.data;

    if (response['Status'] === 'failure') {
        if (response['HttpCode'] !== 201 && response['HttpCode'] !== 200) {
            console.log(`get_ response message: ${response['Message']}`);
            throw error(response['HttpCode'], response['Message']);
        }
    }

    console.log(`get_ response message: ${response['Message']}`);
    return response;
};

export const getFileResourceById = async (sessionId, fileResourceId) => {
    const url = BOT_CONTENT_API_URL + `/file-resources/${fileResourceId}`;

    return await get(sessionId, url, false);
};

export const deleteFileResource = async (sessionId: string, resourceId: string) => {
    const url = BOT_CONTENT_API_URL + `/file-resources/${resourceId}`;
    return await del(sessionId, url, true);
};

export const download = async (sessionId, fileResourceId, attachment = false) => {
    let url = BOT_CONTENT_API_URL + `/file-resources/download/${fileResourceId}`;
    if (attachment) {
        url = url + `?disposition=attachment`;
    }
    const session = await SessionManager.getSession(sessionId);
    const accessToken = session.accessToken;

    const headers = {};
    headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
    headers['Authorization'] = `Bearer ${accessToken}`;
    headers['public'] = true;

    const res = await fetch(url, {
        method: 'GET',
        headers
    });

    const data = await res.arrayBuffer();

    if (data) {
        const responseHeaders = res.headers;
        const contentType = responseHeaders.get('content-type');
        const parts = contentType.split('/');
        const extension = parts.pop();
        let filename = 'download-' + Date.now().toString() + '.' + extension;
        if (attachment === true) {
            const disposition = responseHeaders.get('content-disposition');

            if (disposition) {
                const tokens = disposition.split('filename=');
                if (tokens.length > 1) {
                    filename = tokens[1];
                }
            }
        }

        return {
            success: true,
            Data: {
                Buffer: data,
                FileName: filename,
                MimeType: contentType
            }
        };
    } else {
        const response = await res.json();
        console.log(`get_ response message: ${response.Message}`);
        throw error(response.HttpCode, response.Message);
    }
};

export function downloadAsAttachment(response) {
    const blob = new Blob([response.Data.Buffer]);
    const objUrl = URL.createObjectURL(blob);
    const fileName = response.Data.FileName ?? 'def_download.jpg';

    const a = document.createElement('a');
    a.href = objUrl;
    a.setAttribute('download', fileName);

    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(objUrl);
            a.removeEventListener('click', clickHandler);
        }, 150);
    };
    a.addEventListener('click', clickHandler, false);
    a.click();

    document.body.appendChild(a);
}
