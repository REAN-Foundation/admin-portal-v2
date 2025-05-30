import { ResponseHandler } from "$lib/utils/response.handler";
import { searchParticipantActivities } from "$routes/api/services/careplan/participant.activity.response";
import type { RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchParams: URLSearchParams = event.url.searchParams;
        const participantId = searchParams.get("participantId");

        if (!participantId) {
            return ResponseHandler.handleError(400, null, new Error("Missing required parameter: participantId"));
        }

        const response = await searchParticipantActivities(sessionId, participantId);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving participant activity responses:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
