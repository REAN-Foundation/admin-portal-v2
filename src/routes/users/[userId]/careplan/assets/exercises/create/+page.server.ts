import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createExercise } from '$routes/api/services/careplan/assets/exercises';

//////////////////////////////////////////////////////////////

const createExerciseSchema = zfd.formData({
  name: z.string().max(128),
	description: z.string().optional(),
	exerciseType: z.string().optional(),
	intensityLevel: z.string().optional(),
	recommendedDurationMin: zfd.numeric(z.number().optional()),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
  createExerciseAction: async (event: RequestEvent) => {
    const request = event.request;
    const userId = event.params.userId;
    const sessionId = event.cookies.get('sessionId');
    const data = await request.formData();
    const rawData = Object.fromEntries(data);
    const tags = data.has('tags') ? data.getAll('tags') : [];
    const formDataValue = { ...rawData, tags };

    console.log('formData', JSON.stringify(formDataValue, null, 2));

    type ExerciseSchema = z.infer<typeof createExerciseSchema>;

    let result: ExerciseSchema = {};
    try {
      result = createExerciseSchema.parse(formDataValue);
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
      response = await createExercise(
        sessionId,
        result.name,
        result.description || '',
        result.exerciseType,
        result.intensityLevel,
        result.recommendedDurationMin,
        result.tags || [],
        result.version || ''
      );
    } catch (error: any) {
      const errorMessageText = error?.body?.message || 'An error occurred';
      throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
    }

    const id = response.Data.Exercise.id;
    throw redirect(
      303,
      `/users/${userId}/careplan/assets/exercises/${id}/view`,
      successMessage(`Exercise created successfully!`),
      event
    );
  }
};
