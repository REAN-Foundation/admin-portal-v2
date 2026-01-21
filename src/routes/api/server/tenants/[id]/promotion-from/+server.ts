import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { SOURCE_ENV } from '$env/static/private';
import { promotion } from '$routes/api/services/reancare/tenant.promotion';
import { PromotionEnvironment } from '$lib/types/tenants.types';

export const POST = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
        }

        const tenantId = event.params.id;

        const targetEnvironment = getNextEnvironment(SOURCE_ENV);

        const response = await promotion(sessionId, tenantId, targetEnvironment);

        return ResponseHandler.success(response);
    } catch (error) {
        return ResponseHandler.handleError(500, null, error);
    }
};

function getNextEnvironment(sourceEnv: string): string {
  switch (sourceEnv) {
    case 'development':
      return PromotionEnvironment.UAT;
    case 'uat':
      return PromotionEnvironment.Production;
    case 'production':
      throw new Error('There is no next environment for promotion from production');
    default:
      throw new Error(`Unknown environment: ${sourceEnv}`);
  }
}
