import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { createWordPower } from '$routes/api/services/careplan/assets/word-power';

/////////////////////////////////////////////////////////////////////////

const createWordPowerSchema = zfd.formData({
	name: z.string().max(128),
	description: z.string().optional(),
	additionalResources: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	createWordPowerAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const additionalResources = data.has('additionalResources')
			? data.getAll('additionalResources')
			: [];
		const formDataValue = { ...formData, tags: tags, additionalResources: additionalResources };

		type WordPowerSchema = z.infer<typeof createWordPowerSchema>;

		let result: WordPowerSchema = {};
		try {
			result = createWordPowerSchema.parse(formDataValue);
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

		const response = await createWordPower(
			sessionId,
			result.name,
			result.description,
			result.additionalResources,
			result.tags,
			result.version
		);
		const id = response.Data.id;
		console.log(response);
		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(
				303,
				`/users/${userId}/careplan/assets`,
				errorMessage(response.Message),
				event
			);
		}
		throw redirect(
			303,
			`/users/${userId}/careplan/assets/word-power/${id}/view`,
			successMessage(`Word power created successfully!`),
			event
		);
	}
};
