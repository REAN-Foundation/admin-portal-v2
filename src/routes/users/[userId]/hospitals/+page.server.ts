import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchHospitals } from '../../../api/services/reancare/hospitals';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:healthSystem');
	const response = await searchHospitals(sessionId, {
		orderBy: 'Name',
		order: 'ascending'
	});

	const hospitals = response?.Data?.Hospitals || [];
	
	return {
		hospitals,
		sessionId,
		message: response?.Message || 'Hospitals retrieved successfully',
		title: 'Hospital Systems-Hospitals'
	};
};
