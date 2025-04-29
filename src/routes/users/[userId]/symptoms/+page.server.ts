import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { searchSymptoms } from '../../../api/services/reancare/symptoms';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:symptoms');
	const response = await searchSymptoms(sessionId, {
		orderBy: 'Symptom',
		order: 'ascending'
	});

	// const symptomsCount = response?.Data?.SymptomTypes?.TotalCount || [];
	const symptoms = response?.Data?.SymptomTypes || [];

	return {
		// symptomsCount,
		symptoms,
		sessionId,
		message: response?.Message || 'Health Systems retrieved successfully',
		backendUrl: BACKEND_API_URL,
		title: 'Clinical-Symptoms'
	};
};
