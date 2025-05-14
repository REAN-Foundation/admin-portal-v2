import type { RequestEvent } from "@sveltejs/kit";
import { deleteAsset } from "../../../../services/careplan/assets/action-plan";
import { uuidSchema } from "$lib/validation/common.schema";

export const DELETE = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return new Response(JSON.stringify({
                HttpCode: 403,
                Message: 'Access denied: Invalid session'
            }), { status: 403 });
        }

        const result = await uuidSchema.safeParseAsync(event.params);
        if (!result.success) {
            return new Response(JSON.stringify({
                HttpCode: 400,
                Message: 'Validation failed'
            }), { status: 400 });
        }

        const assetId = event.params.id;
        const selectAsset = event.url.searchParams.get('assetType');
        console.log('assest id', assetId, 'Assest type', selectAsset);

        const response = await deleteAsset(sessionId, selectAsset, assetId);

        return new Response(JSON.stringify({
            HttpCode: 200,
            Message: response.Message
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error deleting asset:', error);
        return new Response(JSON.stringify({
            HttpCode: 500,
            Message: `Error deleting asset: ${error?.message || error}`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
