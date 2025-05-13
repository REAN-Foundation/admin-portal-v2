import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createConsultation = async (
  sessionId: string,
  name: string,
  description: string,
  consultationType: string,
  tags: string[],
  version: string
) => {
  const body = {
    Name: name,
    Description: description,
    ConsultationType: consultationType,
    Tags: tags,
    Version: !version || version?.length === 0 ? 'V 1.0' : version,
  };

  const url = CAREPLAN_BACKEND_API_URL + '/assets/consultations';
  return await post(sessionId, url, body, true);
};

export const getConsultationById = async (sessionId: string, consultationId: string) => {
  const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
  return await get(sessionId, url, true);
};

export const searchConsultation = async (sessionId: string, searchParams) => {
  
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
  const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/search${searchString}`;
  return await get(sessionId, url, true);
};

export const updateConsultation = async (
  sessionId: string,
  consultationId: string,
  name: string,
  description: string,
  consultationType: string,
  tags: string[],
  version: string
) => {
  const body = {
    Name: name,
    Description: description,
    ConsultationType: consultationType,
    Tags: tags,
    Version: !version || version?.length === 0 ? 'V 1.0' : version,
  };

  const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
  return await put(sessionId, url, body, true);
};

export const deleteConsultation = async (sessionId: string, consultationId: string) => {
  const url = CAREPLAN_BACKEND_API_URL + `/assets/consultations/${consultationId}`;
  return await del(sessionId, url, true);
};
