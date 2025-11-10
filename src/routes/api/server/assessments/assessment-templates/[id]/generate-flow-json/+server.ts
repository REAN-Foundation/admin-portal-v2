import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import type { RequestEvent } from "@sveltejs/kit";
import { exportAssessmentTemplate } from "../../../../../services/reancare/assessments/assessment-templates";
import { AssessmentTemplateToWhatsappFlowJsonConverter } from "../../../../../services/flow-json/AssessmentTemplateToWhatsappFlowJsonConverter";

export const GET = async (event: RequestEvent) => {
	try {
        console.log('Generate Flow JSON endpoint called');
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const id = event.params.id;
        console.log('Generate Flow JSON endpoint called, template id:', id, sessionId);
		const assessmentTemplate = await exportAssessmentTemplate(sessionId, id);
        console.log('Generate Flow JSON endpoint called', assessmentTemplate);
        const flowJsonconverter = new AssessmentTemplateToWhatsappFlowJsonConverter();
    
        const flowJson = flowJsonconverter.convert(assessmentTemplate);

		// Convert the data to a JSON string
		const jsonString = JSON.stringify(flowJson, null, 2);

		// Create a Response with correct headers for download
		return new Response(jsonString, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="assessment-template-${id}.json"`,
			},
		});
	} catch (error) {
		console.error("Error converting to flow json:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
