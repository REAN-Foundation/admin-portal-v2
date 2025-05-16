import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createChallenges } from '$routes/api/services/careplan/assets/challenges';

//////////////////////////////////////////////////////////////

const createChallengesSchema = zfd.formData({
  name: z.string().max(128),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
  createChallengesAction: async (event: RequestEvent) => {
    const request = event.request;
    const userId = event.params.userId;
    const sessionId = event.cookies.get('sessionId');
    const data = await request.formData();
    const rawData = Object.fromEntries(data);
    const tags = data.has('tags') ? data.getAll('tags') : [];
    const formDataValue = { ...rawData, tags };

    console.log('formData', JSON.stringify(formDataValue, null, 2));

    type ChallengesSchema = z.infer<typeof createChallengesSchema>;

    let result: ChallengesSchema = {};
    try {
      result = createChallengesSchema.parse(formDataValue);
      console.log('result', result);
    } catch (err: any) {
      const { fieldErrors: errors } = err.flatten();
      console.log(errors);
      const { ...rest } = rawData;
      return {
        data: rest,
        errors
      };
    }

    let response;
    try {
      response = await createChallenges(
        sessionId,
			  result.name,
			  result.description,
			  result.tags,
			  result.version
      );
    } catch (error: any) {
      const errorMessageText = error?.body?.message || 'An error occurred';
      throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
    }

    const id = response.Data.Challenge.id;
    throw redirect(
      303,
      `/users/${userId}/careplan/assets/challenges/${id}/view`,
      successMessage(`Challenges created successfully!`),
      event
    );
  }
};
