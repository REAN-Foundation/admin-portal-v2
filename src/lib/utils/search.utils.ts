import type { RequestEvent } from '@sveltejs/kit';

//////////////////////////////////////////////////////////////////////////////

export interface SearchFilters {
	[key: string]: any;
}

export interface BaseSearchFilters extends SearchFilters {
	orderBy?: string;
	order?: string;
	itemsPerPage?: number;
	pageIndex?: number;
}

export interface TenantScopedSearchFilters extends BaseSearchFilters {
	tenantId?: string;
	tenantCode?: string;
}

export function createSearchFilters(
	event: RequestEvent,
	additionalFilters: Record<string, any> = {}
): TenantScopedSearchFilters {
	const searchParams: URLSearchParams = event.url.searchParams;
	const tenantId = event.locals?.sessionUser?.tenantId;
	const userRole = event.locals?.sessionUser?.roleName;

	const baseFilters: BaseSearchFilters = {
		orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
		order: searchParams.get('sortOrder') ?? 'ascending',
		itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
		pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
	};

	const filters: TenantScopedSearchFilters = {
		...baseFilters,
		...additionalFilters
	};

	const isSystemAdmin = userRole === 'System admin' || userRole === 'System user';
	const tenantCode = event.locals?.sessionUser?.tenantCode;

	// Clean up control flags from output
	delete filters.excludeTenantId;
	delete filters.useTenantCode;
	delete filters.useTenantCodeAsTenantId;

	if (additionalFilters.useTenantCode) {
		// Careplan service: uses tenantCode
		delete filters.tenantId;
		if (isSystemAdmin) {
			const explicit = searchParams.get('tenantCode');
			if (explicit) filters.tenantCode = explicit;
		} else {
			filters.tenantCode = tenantCode;
		}
	} else if (additionalFilters.useTenantCodeAsTenantId) {
		// Bot Content prompt-templates: field is "tenantId" but value is tenantCode
		if (isSystemAdmin) {
			const explicit = searchParams.get('tenantCode') ?? searchParams.get('tenantId');
			if (explicit) filters.tenantId = explicit;
		} else {
			filters.tenantId = tenantCode;
		}
	} else if (additionalFilters.excludeTenantId) {
		// Explicitly excluded
		delete filters.tenantId;
	} else {
		// Reancare service: uses tenantId (UUID)
		if (isSystemAdmin) {
			const explicit = searchParams.get('tenantId');
			if (explicit) filters.tenantId = explicit;
		} else if (tenantId) {
			filters.tenantId = tenantId;
		}
	}

	return filters;
}
export function extractSearchParams(
	event: RequestEvent,
	paramNames: string[]
): Record<string, any> {
	const searchParams: URLSearchParams = event.url.searchParams;
	const tenantId = event.locals?.sessionUser?.tenantId;
	const userRole = event.locals?.sessionUser?.roleName;
	
	const params: Record<string, any> = {};
	
	// Extract specified parameters
	for (const paramName of paramNames) {
		const value = searchParams.get(paramName);
		if (value !== null) {
			params[paramName] = value;
		}
	}
	
	const isSystemAdmin = userRole === 'System admin' || userRole === 'System user';
	if (isSystemAdmin) {
		// Allow system admins to explicitly filter by tenant via URL params
		const explicit = searchParams.get('tenantId');
		if (explicit) params.tenantId = explicit;
	} else if (tenantId) {
		params.tenantId = tenantId;
	}

	return params;
} 
