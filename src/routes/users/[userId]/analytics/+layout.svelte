<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import DashboardTabs from '$lib/components/navbar/dashboard.tabs.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import TenantFilter from '$lib/components/tenant-filter.svelte';
	import type { PageServerData, LayoutServerData } from './$types';
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { children, data } = $props();

	let hasAnyFeatureData = $derived(data.hasAnyFeatureData ?? true);

	// Reactive tenantCode: use URL param if present (system admin), else session default
	let effectiveTenantCode = $derived(
		page.url.searchParams.get('tenantCode') || data.sessionUser?.tenantCode || data.sessionUser?.tenantName
	);
	const tenantCode = data.sessionUser?.tenantCode || data.sessionUser?.tenantName;

	function handleTenantSelect(tenant: { tenantId: string; tenantCode: string } | null) {
		const url = new URL(window.location.href);
		if (tenant) {
			url.searchParams.set('tenantId', tenant.tenantId);
			url.searchParams.set('tenantCode', tenant.tenantCode);
		} else {
			url.searchParams.delete('tenantId');
			url.searchParams.delete('tenantCode');
		}
		goto(url.pathname + url.search, { invalidateAll: true });
	}

	async function handleDownloadReportClick(event: any) {
		console.log('Handling download report click', event);
		try {
			const response = await fetch(`/api/server/users-stats/get-user-stats-report`, {
				method: 'GET',
				headers: { 'Content-type': 'application/json' }
			});
			if (response.ok) {
				const arrayBuffer = await response.arrayBuffer();
				const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'Summary_Report.pdf';
				document.body.appendChild(a);
				a.click();
				invalidateAll();
			}
			invalidateAll();
		} catch (error) {
			invalidateAll();
		}
	}

	async function handleDownloadAnalyticsReportInJSONClick(event: any) {
		console.log('Handling download analytics report in JSON click', event);
		try {
			const response = await fetch(`/api/server/analytics/get-analytics-report-json?tenantCode=${effectiveTenantCode}`, {
				method: 'GET',
				headers: { 'Content-type': 'application/json' }
			});
			if (response.ok) {
				const arrayBuffer = await response.arrayBuffer();
				const blob = new Blob([arrayBuffer], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.json`;
				document.body.appendChild(a);
				a.click();
				invalidateAll();
			}
			invalidateAll();
		} catch (error) {
			invalidateAll();
		}
	}

	async function handleDownloadAnalyticsReportInExcelClick(event: any) {
		console.log('Handling download analytics report in excel click', event);
		try {
			const response = await fetch(`/api/server/analytics/get-analytics-report-excel?tenantCode=${effectiveTenantCode}`, {
				method: 'GET',
				headers: { 'Content-type': 'application/json' }
			});
			if (response.ok) {
				const arrayBuffer = await response.arrayBuffer();
				const blob = new Blob([arrayBuffer], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
				document.body.appendChild(a);
				a.click();
				invalidateAll();
			}
			invalidateAll();
		} catch (error) {
			invalidateAll();
		}
	}

	async function handleDownloadAnalyticsReportInPdfClick(event: any) {
		console.log('Handling download analytics report in pdf click', event);
		try {
			const response = await fetch(`/api/server/analytics/get-analytics-report-pdf?tenantCode=${effectiveTenantCode}`, {
				method: 'GET',
				headers: { 'Content-type': 'application/json' }
			});
			if (response.ok) {
				const arrayBuffer = await response.arrayBuffer();
				const blob = new Blob([arrayBuffer], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
				document.body.appendChild(a);
				a.click();
				invalidateAll();
			}
			invalidateAll();
		} catch (error) {
			invalidateAll();
		}
	}
	const userId = page.params.userId;
</script>

{#if hasAnyFeatureData}
	<div class="">
		<div class="mb-3 w-full md:w-80">
			<TenantFilter
				sessionUser={data.sessionUser}
				tenantParam="tenantCode"
				onSelect={handleTenantSelect}
			/>
		</div>
		<DashboardTabs
			downloadAnalyticsJSONReport={handleDownloadAnalyticsReportInJSONClick}
			downloadAnalyticsExcelReport={handleDownloadAnalyticsReportInExcelClick}
			downloadAnalyticsPdfReport={handleDownloadAnalyticsReportInPdfClick}
			{userId}
			{tenantCode}
		/>
	</div>
	{@render children()}
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<EmptyState message="Data Not Available" />
	</div>
{/if}
