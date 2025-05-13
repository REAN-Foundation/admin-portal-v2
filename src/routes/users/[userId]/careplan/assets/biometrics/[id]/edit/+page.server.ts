import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBiometricsById } from '../../../../../../../api/services/careplan/assets/biometrics';


////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const biometricsId = event.params.id;
	const response = await getBiometricsById(sessionId, biometricsId);

	const biometrics = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		biometrics,
		message: response?.Message || 'biometrics retrieved successfully',
		title: 'Biometrics Edit'
	};
};

