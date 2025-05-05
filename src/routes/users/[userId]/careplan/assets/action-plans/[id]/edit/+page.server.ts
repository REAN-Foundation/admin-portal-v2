import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage, successMessage } from '$lib/utils/message.utils';

import { z } from 'zod';
import { zfd } from 'zod-form-data';
import {
	getActionPlanById,
	updateActionPlan
} from '../../../../../../../api/services/careplan/assets/action-plan';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId', sessionId);

	try {
		const actionPlanId = event.params.id;
		console.log(actionPlanId);
		const response = await getActionPlanById(sessionId, actionPlanId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const actionPlan = response.Data;
		console.log('Action plan', actionPlan);
		return {
			actionPlan
		};
	} catch (error) {
		console.error(`Error retriving action plan: ${error.message}`);
	}
};

const updateActionPlanSchema = zfd.formData({
	name: z.string().max(128),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	updateActionPlanAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const actionPlanId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type ActionPlanSchema = z.infer<typeof updateActionPlanSchema>;

		let result: ActionPlanSchema = {};
		try {
			result = updateActionPlanSchema.parse(formDataValue);
			console.log('result', result);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			console.log(errors);
			const { ...rest } = formData;
			return {
				data: rest,
				errors
			};
		}

		const response = await updateActionPlan(
			sessionId,
			actionPlanId,
			result.name,
			result.description,
			result.tags,
			result.version
		);
		const id = response.Data.id;

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(
				303,
				`/users/${userId}/careplan/assets`,
				errorMessage(response.Message),
				event
			);
		}
		throw redirect(
			303,
			`/users/${userId}/careplan/assets/action-plans/${id}/view`,
			successMessage(`Action plan updated successfully!`),
			event
		);
	}
};
