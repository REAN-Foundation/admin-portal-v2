import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createConsultation } from '$routes/api/services/careplan/assets/consultations';

//////////////////////////////////////////////////////////////

const createConsultationSchema = zfd.formData({
  name: z.string().max(256),
  description: z.string().max(1000).optional(),
  consultationType: z.string().max(256),
  tags: z.array(z.string()).optional(),
  version: z.string().optional()
});

export const actions = {
  createConsultationAction: async (event: RequestEvent) => {
    const request = event.request;
    const userId = event.params.userId;
    const sessionId = event.cookies.get('sessionId');
    const data = await request.formData();
    const rawData = Object.fromEntries(data);
    const tags = data.has('tags') ? data.getAll('tags') : [];
    const formDataValue = { ...rawData, tags };

    console.log('formData', JSON.stringify(formDataValue, null, 2));

    type ConsultationSchema = z.infer<typeof createConsultationSchema>;

    let result: ConsultationSchema = {};
    try {
      result = createConsultationSchema.parse(formDataValue);
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
      response = await createConsultation(
        sessionId,
        result.name,
        result.description || '',
        result.consultationType,
        result.tags || [],
        result.version || ''
      );
    } catch (error: any) {
      const errorMessageText = error?.body?.message || 'An error occurred';
      throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
    }

    const id = response.Data.Consultation.id;
    throw redirect(
      303,
      `/users/${userId}/careplan/assets/consultations/${id}/view`,
      successMessage(`Consultation created successfully!`),
      event
    );
  }
};
