import { exportCareplanById } from '$routes/api/services/careplan/careplans';
import type { RequestEvent } from '@sveltejs/kit';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	const request = event.request;
	const data = await request.json();

	try {
		const blob = await exportCareplanById(
			data.sessionId,
			data.carePlanId,
		);
		return new Response(blob, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		console.error(`Error in exporting careplan: ${err.message}`);
		return new Response(err.message);
	}
};
