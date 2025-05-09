import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { getWordPowerById, updateWordPower } from '$routes/api/services/careplan/assets/word-power';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	try {
		const wordPowerId = event.params.id;
		const response = await getWordPowerById(sessionId, wordPowerId);
		const wordPower = response.Data;
		return {
			wordPower
		};
	} catch (error) {
		console.error(`Error retriving word power: ${error.message}`);
	}
};

const updateWordPowerSchema = zfd.formData({
	name: z.string().max(128),
	description: z.string().optional(),
	additionalResources: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	updateWordPowerAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const wordPowerId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const additionalResources = data.has('additionalResources')
			? data.getAll('additionalResources')
			: [];
		const formDataValue = { ...formData, tags: tags, additionalResources: additionalResources };

		type WordPowerSchema = z.infer<typeof updateWordPowerSchema>;

		let result: WordPowerSchema = {};
		try {
			result = updateWordPowerSchema.parse(formDataValue);
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

		const response = await updateWordPower(
			sessionId,
			wordPowerId,
			result.name,
			result.description,
			result.additionalResources,
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
			`/users/${userId}/careplan/assets/word-power/${id}/view`,
			successMessage(`Word power updated successfully!`),
			event
		);
	}
};
