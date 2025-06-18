import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import type { ExerciseCreateModel } from "$lib/types/exercises.types";
import { createOrUpdateSchema } from "$lib/validation/exercises.schema";
import { createExercise } from "$routes/api/services/careplan/assets/exercises";

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside exercise POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: ExerciseCreateModel = await request.json();

        console.log("data", data);
        const validationResult = createOrUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createExercise(
            sessionId,
            data.Name,
            data.Description ?? '',     
            data.ExerciseType,
            data.IntensityLevel,
            data.RecommendedDurationMin,
            data.Tags,
            data.Version,
            data.TenantId
            );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating exercise:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

