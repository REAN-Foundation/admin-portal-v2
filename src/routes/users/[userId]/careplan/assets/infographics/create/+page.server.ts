// import { redirect } from 'sveltekit-flash-message/server';
// import type { RequestEvent } from '@sveltejs/kit';
// import { z } from 'zod';
// import { zfd } from 'zod-form-data';
// import { errorMessage, successMessage } from '$lib/utils/message.utils';
// import { createInfographics } from '$routes/api/services/careplan/assets/infographics';

// //////////////////////////////////////////////////////////////

// const createInfographicsSchema = zfd.formData({
//   name: z.string().max(128),
// 	description: z.string().optional(),
// 	pathUrl: z.string().optional(),
// 	tags: z.array(z.string()).optional(),
// 	version: z.string().optional()
// });

// export const actions = {
//   createInfographicsAction: async (event: RequestEvent) => {
//     const request = event.request;
//     const userId = event.params.userId;
//     const sessionId = event.cookies.get('sessionId');
//     const data = await request.formData();
//     const rawData = Object.fromEntries(data);
//     const tags = data.has('tags') ? data.getAll('tags') : [];
//     const formDataValue = { ...rawData, tags };

//     console.log('formData', JSON.stringify(formDataValue, null, 2));

//     type InfographicsSchema = z.infer<typeof createInfographicsSchema>;

//     let result: InfographicsSchema = {};
//     try {
//       result = createInfographicsSchema.parse(formDataValue);
//       console.log('result', result);
//     } catch (err: any) {
//       const { fieldErrors: errors } = err.flatten();
//       console.log(errors);
//       const { ...rest } = rawData;
//       return {
//         data: rest,
//         errors
//       };
//     }

//     let response;
//     try {
//       response = await createInfographics(
//         sessionId,
// 			  result.name,
// 			  result.description,
// 			  result.pathUrl,
// 			  result.tags,
// 			  result.version
//       );
//     } catch (error: any) {
//       const errorMessageText = error?.body?.message || 'An error occurred';
//       throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(errorMessageText), event);
//     }

//     const id = response.Data.Infographics.id;
//     throw redirect(
//       303,
//       `/users/${userId}/careplan/assets/infographics/${id}/view`,
//       successMessage(`Infographics created successfully!`),
//       event
//     );
//   }
// };
