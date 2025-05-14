import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createBiometrics = async (
  sessionId: string,
  name: string,
  description: string,
  biometricsType: string,
  measurementUnit: string,
  tags: string[],
  version: string
) => {
  const body = {
    Name: name,
    Description: description,
    BiometricsType: biometricsType,
    MeasurementUnit: measurementUnit,
    Tags: tags,
    Version: !version || version?.length === 0 ? 'V 1.0' : version,
  };

  const url = CAREPLAN_BACKEND_API_URL + '/assets/biometrics';
  return await post(sessionId, url, body, true);
};

export const getBiometricsById = async (sessionId: string, biometricsId: string) => {
  const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
  return await get(sessionId, url, true);
};

export const searchBiometrics = async (sessionId: string, searchParams) => {
  
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
  const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/search${searchString}`;
  return await get(sessionId, url, true);
};

export const updateBiometrics = async (
  sessionId: string,
  biometricsId: string,
  name: string,
  description: string,
  biometricsType: string,
  measurementUnit: string,
  tags: string[],
  version: string
) => {
  const body = {
    Name: name,
    Description: description,
    BiometricsType: biometricsType,
    MeasurementUnit: measurementUnit,
    Tags: tags,
    Version: !version || version?.length === 0 ? 'V 1.0' : version,
  };

  const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
  return await put(sessionId, url, body, true);
};

export const deleteBiometrics = async (sessionId: string, biometricsId: string) => {
  const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
  return await del(sessionId, url, true);
};
