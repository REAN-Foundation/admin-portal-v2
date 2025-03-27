import { BACKEND_API_URL } from '$env/static/private';
import { USER_ANALYTICS_API_URL } from '$env/static/private';
import { API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DateStringFormat } from '$lib/types/time.types';
import { Helper } from '$lib/utils/helper';
import { TimeHelper } from '$lib/utils/time.helper';
import { DashboardManager } from '../../cache/dashboard/dashboard.manager';
import { SessionManager } from '../../cache/session/session.manager';
import { get_ } from '../common';
import { get } from './common.reancare';

////////////////////////////////////////////////////////////////

// export const getTolalUsers = async (sessionId: string, searchParams?: any) => {
// 	let searchString = '';
// 	if (searchParams) {
// 		const keys = Object.keys(searchParams);
// 		if (keys.length > 0) {
// 			searchString = '?';
// 			const params = [];
// 			for (const key of keys) {
// 				if (searchParams[key]) {
// 					const param = `${key}=${searchParams[key]}`;
// 					params.push(param);
// 				}
// 			}
// 			searchString  += params.join('&');
// 		}
// 	}
// 	const url = BACKEND_API_URL + `/users-statistics/users${searchString}`;
//   console.log("url", url)
// 	return await get_(sessionId, url, true);
// };
// export const getActiveUsers = async (sessionId: string, searchParams?: any) => {
// 	let searchString = '';
// 	if (searchParams) {
// 		const keys = Object.keys(searchParams);
// 		if (keys.length > 0) {
// 			searchString = '?';
// 			const params = [];
// 			for (const key of keys) {
// 				if (searchParams[key]) {
// 					const param = `${key}=${searchParams[key]}`;
// 					params.push(param);
// 				}
// 			}
// 			searchString  += params.join('&');
// 		}
// 	}
// 	const url = BACKEND_API_URL + `/users-statistics/active-users${searchString}`;
// 	return await get_(sessionId, url, true);
// };

export const getGenderWiseUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-genders${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getAgeWiseUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-ages${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getMaritalStatusWiseUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-marital-statuses${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getDeviceDetailWiseUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-device-details${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

// export const getDeletdUsers = async (sessionId: string, searchParams?: any) => {
// 	let searchString = '';
// 	if (searchParams) {
// 		const keys = Object.keys(searchParams);
// 		if (keys.length > 0) {
// 			searchString = '?';
// 			const params = [];
// 			for (const key of keys) {
// 				if (searchParams[key]) {
// 					const param = `${key}=${searchParams[key]}`;
// 					params.push(param);
// 				}
// 			}
// 			searchString  += params.join('&');
// 		}
// 	}
// 	const url = BACKEND_API_URL + `/users-statistics/deleted-users${searchString}`;
// 	return await get_(sessionId, url, true);
// };

export const getEnrollmetUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-enrollments${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getAppDownloadsData = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/app-downloads${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getCountryWiseUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-countries${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getMajorAilment = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-major-ailments${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getObesityDistribution = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-obesities${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getOverallUsers = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/users-count${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getDailyStatistics = async (sessionId: string) => {
	const url = BACKEND_API_URL + `/daily-stats`;
	const today = TimeHelper.getDateString(new Date(), DateStringFormat.YYYY_MM_DD);
	const cacheKey = `session-${sessionId}:req-getDailyStatistics:${today}`;
	const yesterday = TimeHelper.getYesterdayDate();
	const yesterdayCacheKey = `session-${sessionId}:req-getDailyStatistics:${yesterday}`;

	if (await DashboardManager.has(yesterdayCacheKey)) {
		await DashboardManager._cache.delete(yesterdayCacheKey);
		console.log(`Cleared old key: ${yesterdayCacheKey}`);
	}
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getDailyTenantStatistics = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/daily-stats/tenants/${tenantId}`;
	const today = TimeHelper.getDateString(new Date(), DateStringFormat.YYYY_MM_DD);
	const cacheKey = `session-${sessionId}:req-getDailyTenantStatistics:${today}`;
	const yesterday = TimeHelper.getYesterdayDate();
	const yesterdayCacheKey = `session-${sessionId}:req-getDailyTenantStatistics:${yesterday}`;

	if (await DashboardManager.has(yesterdayCacheKey)) {
		await DashboardManager._cache.delete(yesterdayCacheKey);
		console.log(`Cleared old key: ${yesterdayCacheKey}`);
	}
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getDailySystemStatistics = async (sessionId: string) => {
	const url = BACKEND_API_URL + `/daily-stats`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getDailyTenantStatsReport = async (sessionId: string, resourceId: string) => {
	const url = BACKEND_API_URL + `/file-resources/${resourceId}/download`;
	const session = await SessionManager.getSession(sessionId);

	const response = await get_(url, true, sessionId);

	if (response) {
		return response;
	}

	return null;
};

export const getAddictionDistribution = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-addictions${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getHealthPillarDistribution = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-health-pillars${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getRoleDistribution = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-roles${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getBiometricsDistribution = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/by-biometrics${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getUsersStats = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/users-stats${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getYears = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/users-statistics/years`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getDailyStatisticsUserAnalytics = async (sessionId: string, formattedDate: string) => {
	console.log('Formated date: ' + formattedDate);
	const url = USER_ANALYTICS_API_URL + `/analytics/metrics/${formattedDate}-1`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
