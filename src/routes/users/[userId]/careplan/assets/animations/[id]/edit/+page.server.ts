import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import {
	getAnimationById,
	updateAnimation
} from '../../../../../../../api/services/careplan/assets/animation';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const animationId = event.params.id;
		const response = await getAnimationById(sessionId, animationId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const animation = response.Data;

		return {
			animation
		};
	} catch (error) {
		console.error(`Error retriving animation: ${error.message}`);
	}
};

const updateAnimationSchema = zfd.formData({
	name: z.string().max(128),
	transcript: z.string().optional(),
	pathUrl: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	updateAnimationAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const animationId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type AnimationSchema = z.infer<typeof updateAnimationSchema>;

		let result: AnimationSchema = {};
		try {
			result = updateAnimationSchema.parse(formDataValue);
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

		const response = await updateAnimation(
			sessionId,
			animationId,
			result.name,
			result.transcript,
			result.pathUrl,
			result.tags,
			result.version
		);
		console.log(response);
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
			`/users/${userId}/careplan/assets/animations/${id}/view`,
			successMessage(`Animation updated successfully!`),
			event
		);
	}
};
