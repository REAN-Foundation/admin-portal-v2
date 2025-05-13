import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createBiometrics } from '../../../../../../api/services/careplan/assets/biometrics';

//////////////////////////////////////////////////////////////

const createBiometricsSchema = zfd.formData({
  name: z.string().max(256),
  description: z.string().max(1000).optional(),
  biometricsType: z.string().max(256),
  measurementUnit: z.string().max(64),
  tags: z.array(z.string()).optional(),
  version: z.string().optional()
});

export const actions = {
  createBiometricsAction: async (event: RequestEvent) => {
    const request = event.request;
    const userId = event.params.userId;
    const sessionId = event.cookies.get('sessionId');
    const data = await request.formData();
    const rawData = Object.fromEntries(data);
    const tags = data.has('tags') ? data.getAll('tags') : [];
    const formDataValue = { ...rawData, tags };

    console.log('formData', JSON.stringify(formDataValue, null, 2));

    type BiometricsSchema = z.infer<typeof createBiometricsSchema>;

    let result: BiometricsSchema = {};
    try {
      result = createBiometricsSchema.parse(formDataValue);
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
      response = await createBiometrics(
        sessionId,
        result.name,
        result.description || '',
        result.biometricsType,
        result.measurementUnit,
        result.tags || [],
        result.version || ''
      );
    } catch (error: any) {
      const errorMessageText = error?.body?.message || 'An error occurred';
      throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
    }

    const id = response.Data.Biometrics.id;
    throw redirect(
      303,
      `/users/${userId}/careplan/assets/biometrics/${id}/view`,
      successMessage(`Biometrics created successfully!`),
      event
    );
  }
};
