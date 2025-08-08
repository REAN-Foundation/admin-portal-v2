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

	// Add tenantId if available and not explicitly excluded
	const filters: TenantScopedSearchFilters = {
		...baseFilters,
		...additionalFilters
	};

	const isSystemAdmin = userRole === 'System admin' || userRole === 'System user';
	const shouldExcludeTenantId = additionalFilters.excludeTenantId || isSystemAdmin;
	
	if (tenantId && !shouldExcludeTenantId) {
		filters.tenantId = tenantId;
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
	
	// Add tenantId if available and user is not a system admin
	const isSystemAdmin = userRole === 'System admin' || userRole === 'System user';
	if (tenantId && !isSystemAdmin) {
		params.tenantId = tenantId;
	}
	
	return params;
} 