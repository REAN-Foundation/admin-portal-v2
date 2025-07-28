import { API_CLIENT_INTERNAL_KEY, BOT_CONTENT_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { delete_, get_, post_, put_ } from '../common';
import { del, get, post, put } from '../reancare/common.reancare';

/////////////////////////////////////////////////////////////////////////

export const createDocuments = async (
	sessionId: string,
	name: string,
	description: string,
	resourceId: string,
	fileName: string,
	source: string,
	parentDocument: string,
	// parentDocumentVersion: string,
	chunkingStrategy: string,
	chunkingLength: number,
	chunkOverlap: number,
	splitter: string,
	isActive: boolean,
	keywords: string,
	documentType: string,
	createdBy: string
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		ResourceId: resourceId ? resourceId : null,
		// FileName: fileName ? fileName : null,
		// Source: source ? source : null,
		// ParentDocument: parentDocument ? parentDocument : null,
		// ParentDocumentVersion: parentDocumentVersion ? parentDocumentVersion : null,
		Keyword: keywords,
		DocumentType: documentType,
		ChunkingStrategy: chunkingStrategy ? chunkingStrategy : null,
		ChunkingLength: chunkingLength ? chunkingLength : null,
		ChunkOverlap: chunkOverlap ? chunkOverlap : null,
		Splitter: splitter ? splitter : null,
		IsActive: isActive ? isActive : false,
		CreatedByUserId: createdBy ? createdBy : null
	};

	const url = BOT_CONTENT_API_URL + '/documents';

	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchDocuments`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getDocumentsById = async (sessionId: string, documentsId: string) => {
	const url = BOT_CONTENT_API_URL + `/documents/${documentsId}`;

	const cacheKey = `session-${sessionId}:req-getDocumentsById-${documentsId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchDocuments = async (sessionId: string, searchParams?: any) => {
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

	const url = BOT_CONTENT_API_URL + `/documents/search${searchString}`;
	console.log('url', url);

	const cacheKey = `session-${sessionId}:req-searchDocuments:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateDocuments = async (
	sessionId: string,
	documentsId: string,
	name: string,
	description: string,
	resourceId: string,
	fileName: string,
	source: string,
	parentDocument: string,
	parentDocumentVersion: string,
	chunkingStrategy: string,
	chunkingLength: number,
	chunkOverlap: number,
	splitter: string,
	isActive: boolean,
	keywords: string,
	documentType: string,
	createdBy: string
) => {
	const body = {
		Name: name,
		Description: description ? description : '',
		ResourceId: resourceId ? resourceId : null,
		// FileName: fileName ? fileName : null,
		// Source: source ? source : null,
		// ParentDocument: parentDocument ? parentDocument : null,
		// ParentDocumentVersion: parentDocumentVersion ? parentDocumentVersion : null,
		ChunkingStrategy: chunkingStrategy ? chunkingStrategy : null,
		ChunkingLength: chunkingLength ? chunkingLength : null,
		ChunkOverlap: chunkOverlap ? chunkOverlap : null,
		Splitter: splitter ? splitter : null,
		IsActive: isActive ? isActive : false,
		Keyword: keywords ? keywords : null,
		DocumentType: documentType ? documentType : null
		// CreatedBy: createdBy ? createdBy : null
	};

	const url = BOT_CONTENT_API_URL + `/documents/${documentsId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [`session-${sessionId}:req-getDocumentsById-${documentsId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [`session-${sessionId}:req-searchDocuments`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteDocuments = async (sessionId: string, documentsId: string) => {
	const url = BOT_CONTENT_API_URL + `/documents/${documentsId}`;

	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getDocumentsById-${documentsId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchDocuments`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
