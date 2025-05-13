import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createAudio } from '../../../../../../api/services/careplan/assets/audio';

//////////////////////////////////////////////////////////////

const createAudioSchema = zfd.formData({
  name: z.string().max(128),
	transcript: z.string().optional(),
	pathUrl: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
  createAudioAction: async (event: RequestEvent) => {
    const request = event.request;
    const userId = event.params.userId;
    const sessionId = event.cookies.get('sessionId');
    const data = await request.formData();
    const rawData = Object.fromEntries(data);
    const tags = data.has('tags') ? data.getAll('tags') : [];
    const formDataValue = { ...rawData, tags };

    console.log('formData', JSON.stringify(formDataValue, null, 2));

    type AudioSchema = z.infer<typeof createAudioSchema>;

    let result: AudioSchema = {};
    try {
      result = createAudioSchema.parse(formDataValue);
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
      response = await createAudio(
        sessionId,
			  result.name,
			  result.transcript,
			  result.pathUrl,
			  result.tags,
			  result.version
      );
    } catch (error: any) {
      const errorMessageText = error?.body?.message || 'An error occurred';
      throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
    }

    const id = response.Data.Audio.id;
    throw redirect(
      303,
      `/users/${userId}/careplan/assets/audio/${id}/view`,
      successMessage(`Audio created successfully!`),
      event
    );
  }
};
