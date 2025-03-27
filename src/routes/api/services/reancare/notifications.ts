import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createNotification = async (
	sessionId: string,
	title: string,
	Body: string,
	type: string,
	broadcastToAll: boolean,
	imageUrl: string
) => {
	const body = {
		Title: title,
		Body: Body ? Body : null,
		Type: type ? type : null,
		BroadcastToAll: broadcastToAll ? broadcastToAll : false,
		ImageUrl: imageUrl ? imageUrl : null
	};
	const url = BACKEND_API_URL + '/general/notifications';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getNotificationById = async (sessionId: string, notificationId: string) => {
	const url = BACKEND_API_URL + `/general/notifications/${notificationId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchNotifications = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/general/notifications/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateNotification = async (
	sessionId: string,
	notificationId: string,
	title: string,
	Body: string,
	type: string,
	broadcastToAll: boolean,
	imageUrl: string
) => {
	const body = {
		Title: title,
		Body: Body ? Body : null,
		Type: type ? type : null,
		BroadcastToAll: broadcastToAll ? broadcastToAll : false,
		ImageUrl: imageUrl ? imageUrl : null
	};
	const url = BACKEND_API_URL + `/general/notifications/${notificationId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteNotification = async (sessionId: string, notificationId: string) => {
	const url = BACKEND_API_URL + `/general/notifications/${notificationId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const sendNotification = async (
	sessionId: string,
	topic:string,
	title: string,
	Body: string,
	type: string,
	url: string
) => {
	const body = {
		Topic: topic,
		Title: title,
		Body: Body ? Body : null,
		Type: type ? type : null,
		url: url ? url : null
	};
	const backendUrl = BACKEND_API_URL + '/user-device-details/notificaion-topic';
	return await post(sessionId, backendUrl, body, true, API_CLIENT_INTERNAL_KEY);
};