import type{ ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHospitalById } from '../../../../../api/services/reancare/hospitals';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const hospitalId = event.params.id;
    const response = await getHospitalById(sessionId, hospitalId);

    const hospital = response?.Data?.Hospital;
    const id = response?.Data?.Hospital?.id;
    return {
        location: `${id}/edit`,
        hospital,
        message: response?.Message || 'Hospitals retrieved successfully',
        title:'Hospital Systems-Hospitals View'
    };
		
	
};
