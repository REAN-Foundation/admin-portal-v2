import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { get_ } from '../../common';
import { get } from '../common.careplan';

//////////////////////////////////////////////////////////////////////////////////

export const getAssetsType = async (sessionId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/types/assets`;
	return await get(sessionId,url, true );
};

export const searchAssets = async (
	sessionId?: string,
	assetTypeRoute?: string,
	searchParams?: any
) => {
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

	const url = CAREPLAN_BACKEND_API_URL + `/assets/${assetTypeRoute}/search${searchString}`;

	console.log('mainurl', url);

	return await get(sessionId, url, true);
};
