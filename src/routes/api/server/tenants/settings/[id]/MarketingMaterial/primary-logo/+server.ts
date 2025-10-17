import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import { uploadMarketingMaterialPrimaryLogo } from "$routes/api/services/reancare/tenant-settings";
import type { RequestEvent } from "@sveltejs/kit";

export const POST = async (event: RequestEvent) => {
	try {
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
		const formData = await event.request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return ResponseHandler.handleError(400, null, new Error("No file provided"));
		}

		const response = await uploadMarketingMaterialPrimaryLogo(sessionId, id, file);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error uploading marketing material primary logo:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
