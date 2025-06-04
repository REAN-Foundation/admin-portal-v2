import { ResponseHandler } from "$lib/utils/response.handler";
import { uuidSchema } from "$lib/validation/common.schema";
import { deleteEnrollment, getEnrollmentById, getEnrollmentStats } from "$routes/api/services/careplan/enrollments";
import type { RequestEvent } from "@sveltejs/kit";

///////////////////////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {

    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
        }

        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            const data = Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || '']));
            return ResponseHandler.handleError(400, data, new Error('Validation failed'));
         }

        const enrollmentId = event.params.id;

        const response = await deleteEnrollment(
            sessionId,
            enrollmentId
        );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
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

        const enrollmentId = event.params.id;

        const response = await getEnrollmentById(sessionId, enrollmentId);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching enrollment:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

export const _GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.request.headers.get("session-id");
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

        const participantId = event.params.id;

        const response = await getEnrollmentStats(sessionId, participantId);
        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error fetching enrollment stats:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
