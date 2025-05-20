import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL, BOT_CONTENT_API_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { ServerHelper } from '$lib/server/server.helper';
import axios from 'axios';
import { del, get } from './common.reancare';
import { SessionManager } from '$routes/api/cache/session/session.manager';

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

	// console.log(JSON.stringify(config, null, 2));

	const res = await axios(config);

	// console.log("res", res);

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

// export const upload = async (sessionId: string, filePath: string, filename: string, isPublic = true) => {

//     const url = BACKEND_API_URL + `/file-resources/upload`;
//     const session = await SessionManager.getSession(sessionId);
//     const accessToken = session.accessToken;

// 	const mimeType = ServerHelper.getMimeTypeFromFileName(filename);
// 	console.log(`mimeType = ${mimeType}`);

//     const p = path.join(process.cwd(), filePath);
//     const form = new FormData();
//     form.append("name", fs.readFileSync(p));
//     //form.append("IsPublicResource", isPublic ? "true" : "false");
//     console.log(filePath);

//     const headers = {
//         ...form.getHeaders()
//     };
//     //headers['enc'] = 'multipart/form-data';
//     // headers['Content-Type'] = "application/x-www-form-urlencoded";
//     headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
//     headers['Authorization'] = `Bearer ${accessToken}`;

//     // const config = {
//     //     method: 'post',
//     //     url: url,
//     //     headers: headers,
//     // };

//     console.log(JSON.stringify(headers, null, 2));
//     console.log(form);

//     const response = await axios.post(url, form, headers);

//     if (response['Status'] === 'failure') {
//         if(response['HttpCode'] !== 201 && response['HttpCode'] !== 200) {
//             console.log(`get_ response message: ${response['Message']}`);
//             throw error(response['HttpCode'], response['Message']);
//         }
//     }

//     console.log(`get_ response message: ${response['Message']}`);
//     return response['Data'];
// };

export const getFileResourceById = async (sessionId, fileResourceId) => {
	const url = BOT_CONTENT_API_URL + `/file-resources/${fileResourceId}`;
	console.log('uri--', url);

	return await get(sessionId, url, false, API_CLIENT_INTERNAL_KEY);
};

export const deleteFileResource = async (sessionId: string, resourceId: string) => {
	const url = BOT_CONTENT_API_URL + `/file-resources/${resourceId}`;
	console.log('uri--', url);
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const download = async (sessionId, fileResourceId, asAttachment = false) => {
	let url = BOT_CONTENT_API_URL + `/file-resources/download/${fileResourceId}`;
	if (asAttachment) {
		url = url + `?disposition=attachment`;
	}
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;
	// return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const headers = {};
	headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
	headers['Authorization'] = `Bearer ${accessToken}`;
	headers['public'] = true;

	const res = await fetch(url, {
		method: 'GET',
		headers
	});

	// console.log('ress', res);

	const data = await res.arrayBuffer();
	console.log('data', data);

	// 	const blob = new Blob([data]);

	// const url_ = URL.createObjectURL(blob);
	// const link = document.createElement('a');
	// link.href = url_;
	// link.download = filename;
	// link.click();

	// URL.revokeObjectURL(url);

	if (data) {
		const responseHeaders = res.headers;
		console.log('resposneHeader', responseHeaders);

		const contentType = responseHeaders.get('content-type');
		console.log('contentType', contentType);

		const parts = contentType.split('/');
		console.log('parts', parts);

		const extension = parts.pop();
		console.log('extension', extension);

		let filename = 'download-' + Date.now().toString() + '.' + extension;
		console.log('filename', filename);

		if (asAttachment === true) {
			const disposition = responseHeaders.get('content-disposition');
			console.log('disposition', disposition);

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
