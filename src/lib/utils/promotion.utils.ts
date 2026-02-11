import { SOURCE_ENV } from '$env/static/private';
import { PromotionEnvironment } from '$lib/types/tenants.types';

export function getNextEnvironment(sourceEnv: string): string {
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

export function getTargetEnvironment(): string {
	return getNextEnvironment(SOURCE_ENV);
}
