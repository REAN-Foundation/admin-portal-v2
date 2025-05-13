import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createPromptsTemplate } from '../../../../../api/services/bot-content/prompt-template';

/////////////////////////////////////////////////////////////////////////


const createPromptsSchema = zfd.formData({
    name: z.string().max(128),
    description: z.string(),
    content: z.string(),
    type: z.string().optional(),
    category: z.string(),
    subgroup: z.string(),
    variable: z.array(z.string()).optional(), // Expect an array of strings
    version : z.number().optional()
});

export const actions = {
    createPromptTemplate: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');

        const rawFormData = await request.formData();
        const formData = Object.fromEntries(rawFormData);

        // Process 'variable' field
        let variables: string[] = [];
        const rawVariables = rawFormData.get('variable'); // Directly access form data
        if (typeof rawVariables === 'string') {
            try {
                variables = JSON.parse(rawVariables); // Parse the stringified array
            } catch {
                variables = rawVariables.split(','); // Fallback to splitting by commas
            }
        }

        type PromptsSchema = z.infer<typeof createPromptsSchema>;

        let result: PromptsSchema = {};
        try {
            console.log('Parsed formData:', { ...formData, variable: variables });
            result = createPromptsSchema.parse({
                ...formData,
                variable: variables, // Inject parsed variables into the schema
            });
            console.log('Validation result:', result);
        } catch (err: any) {
            const { fieldErrors: errors } = err.flatten();
            console.log('Validation errors:', errors);
            return {
                data: { ...formData, variable: variables },
                errors,
            };
        }

        const response = await createPromptsTemplate(
            sessionId,
            result.name,
            result.description,
            result.content,
            result.category,
            result.subgroup,
            result.type,
            result.variable,
            result.version,
            userId
        );

        const id = response.Data.id;
        console.log('API Response:', response);
        if (response.Status === 'failure' || response.HttpCode !== 201) {
            throw redirect(303, `/users/${userId}/bot-content/prompt-template`, errorMessage(response.Message), event);
        }

        throw redirect(
            303,
            `/users/${userId}/bot-content/prompt-template/${id}/view`,
            successMessage(`Prompt created successfully!`),
            event
        );
    },
};
