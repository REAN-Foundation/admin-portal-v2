import { BOT_WRAPPER_CLIENT_API_KEY } from '$env/static/private';
import { get_ } from '../common';

export const get = async (url: string) => {
	return await get_(url, false, undefined, BOT_WRAPPER_CLIENT_API_KEY);
};
