import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
    getQueryResponseTypes,
    searchAssessmentNodes
} from '../../../../../../api/services/reancare/assessments/assessment-nodes';
import { getAssessmentTemplateById } from '../../../../../../api/services/reancare/assessments/assessment-templates';
import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const templateId = event.params.templateId;
    const searchParams = {
        templateId: templateId,
        itemsPerPage: MAX_ITEMS_PER_PAGE
        
    };
    const _queryResponseTypes = await getQueryResponseTypes(sessionId);
    const response = await searchAssessmentNodes(sessionId, searchParams);
    const templateDetails = await getAssessmentTemplateById(sessionId, templateId);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const queryResponseTypes = _queryResponseTypes?.Data?.QueryResponseTypes;
    const assessmentNodes = response?.Data?.AssessmentNodeRecords?.Items;
    const templateData = templateDetails?.Data?.AssessmentTemplate;

    return {
        queryResponseTypes,
        assessmentNodes,
        templateData,
        message: response.Message,
        title: 'Clinical-Assessments-Assessment Nodes Create'
    };
};

// const createAssessmentNodeSchema = zfd.formData({
//     nodeType: z.string(),
//     parentNodeId: z.string().uuid(),
//     title: z.string().min(8).max(256),
//     description: z.string().optional(),
//     sequence: zfd.numeric(z.number().optional()),
//     queryType: z.string().optional(),
//     resolutionScore: zfd.numeric(z.number().default(1)),
//     providerAssessmentCode: z.string().optional(),
//     message: z.string().optional(),
//     serveListNodeChildrenAtOnce: zfd.checkbox({ trueValue: 'true' }),
//     scoringApplicable: zfd.checkbox({ trueValue: 'true' }),
//     options: z.array(z.string()),
//     tags: z.array(z.string()).optional(),
//     correctAnswer: z.string().optional()
// });

// export const actions = {
//     createAssessmentNodeAction: async (event: RequestEvent) => {
//         const request = event.request;
//         const userId = event.params.userId;
//         const templateId = event.params.templateId;
//         const sessionId = event.cookies.get('sessionId');
//         const data = await request.formData();
//         const tags = data.has('tags') ? data.getAll('tags') : [];
//         const options = data.has('options') ? data.getAll('options') : [];
//         const formData = Object.fromEntries(data);
//         const formDataValue = { ...formData, options: options, tags: tags };

//         type AssessmentNodeSchema = z.infer<typeof createAssessmentNodeSchema>;

//         let result: AssessmentNodeSchema = {};
//         try {
//             result = createAssessmentNodeSchema.parse(formDataValue);
//             console.log('result', result);
//         } catch (err: any) {
//             const { fieldErrors: errors } = err.flatten();
//             console.log(errors);
//             const { ...rest } = formData;
//             return {
//                 data: rest,
//                 errors
//             };
//         }

//         let response;
//         try {
//             response = await createAssessmentNode(
//                 sessionId,
//                 templateId,
//                 result.parentNodeId,
//                 result.nodeType,
//                 result.title,
//                 result.description,
//                 result.tags,
//                 result.message,
//                 result.serveListNodeChildrenAtOnce,
//                 result.queryType,
//                 result.options,
//                 result.sequence,
//                 result.correctAnswer
//             );
//         } catch (error: any) {
//             const errorMessageText = error?.body?.message || 'An error occurred';
//             throw redirect(
//                 303,
//                 `/users/${userId}/assessment-templates`,
//                 errorMessage(errorMessageText),
//                 event
//             );
//         }
//         const nodeId = response.Data.AssessmentNode.id;

//         const scoringCondition = await addScoringCondition(sessionId, templateId, nodeId, result.resolutionScore);
//         throw redirect(
//             303,
//             `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`,
//             successMessage(`Assessment node created successfully!`),
//             event
//         );
//     }
// };
