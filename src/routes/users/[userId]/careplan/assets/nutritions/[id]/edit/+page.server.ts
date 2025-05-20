import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNutritionById } from '$routes/api/services/careplan/assets/nutrition';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const nutritionId = event.params.id;
	const response = await getNutritionById(sessionId, nutritionId);

	const nutrition = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		nutrition,
		message: response?.Message || 'Nutrition retrieved successfully',
		title: 'Nutrition Edit'
	};
};
