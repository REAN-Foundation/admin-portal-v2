<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import TenantFilter from '$lib/components/tenant-filter.svelte';
	import DateRangeSelect from '$lib/components/chatbot-analytics/date-range-select.svelte';
	import NumberCard from '$lib/components/dashboard/number.card.svelte';
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import HorizontalBarChart from '$lib/components/users-stats/charts/horizontal-bar-chart.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import { hasChartData } from '$lib/utils/chart.utils';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data }: { data: PageServerData } = $props();

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

	function handleRangeSelect(value: { range: string; startDate: string; endDate: string }) {
		const url = new URL(window.location.href);
		url.searchParams.set('range', value.range);
		if (value.range === 'custom') {
			url.searchParams.set('startDate', value.startDate);
			url.searchParams.set('endDate', value.endDate);
		} else {
			url.searchParams.delete('startDate');
			url.searchParams.delete('endDate');
		}
		goto(url.pathname + url.search, { invalidateAll: true });
	}

	let series = $derived(data.series ?? []);
	let topContent = $derived(data.topContent ?? []);

	let totalNewUsers = $derived(
		series.reduce((sum: number, s: any) => sum + (s.newUsers ?? 0), 0)
	);
	let totalMessagesReceived = $derived(
		series.reduce((sum: number, s: any) => sum + (s.messagesReceived ?? 0), 0)
	);
	let totalMessagesSent = $derived(
		series.reduce((sum: number, s: any) => sum + (s.messagesSent ?? 0), 0)
	);
	let totalQuestionsAsked = $derived(
		series.reduce((sum: number, s: any) => sum + (s.questionsAsked ?? 0), 0)
	);

	let dailySeriesLabels = $derived(series.map((s: any) => s.date));
	let dailySeriesMessagesReceived = $derived(series.map((s: any) => s.messagesReceived));

	let topContentLabels = $derived(topContent.map((c: any) => c.content));
	let topContentCounts = $derived(topContent.map((c: any) => c.count));
</script>

<div class="px-6 pt-4">
	<div class="grid w-full grid-cols-3 gap-2 text-center md:flex md:w-auto md:space-x-4">
		<span class="btn variant-filled-secondary flex items-center justify-center gap-2">
			<Icon icon="material-symbols:dashboard-outline-rounded" class="h-5 w-5" />
			Dashboard
		</span>
		<span
			class="btn variant-soft-secondary flex cursor-not-allowed items-center justify-center gap-2 opacity-50"
			title="Coming soon"
		>
			<Icon icon="material-symbols:table-chart-outline-rounded" class="h-5 w-5" />
			Workflow Summary
		</span>
		<span
			class="btn variant-soft-secondary flex cursor-not-allowed items-center justify-center gap-2 opacity-50"
			title="Coming soon"
		>
			<Icon icon="material-symbols:monitoring" class="h-5 w-5" />
			Daily Workflow Monitoring
		</span>
	</div>

	<div class="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<div class="w-full md:w-80">
			<TenantFilter
				sessionUser={data.sessionUser}
				tenantParam="tenantCode"
				onSelect={handleTenantSelect}
			/>
		</div>
		{#if data.tenantSelected}
			<DateRangeSelect
				range={data.range}
				startDate={data.startDate}
				endDate={data.endDate}
				onSelect={handleRangeSelect}
			/>
		{/if}
	</div>
</div>

{#if !data.tenantSelected}
	<div class="flex min-h-[40vh] items-center justify-center">
		<EmptyState message="Select a tenant to view chatbot analytics" />
	</div>
{:else}
	<dl class="dashboard-cards">
		<NumberCard cardTitle="Number of Unique Users" cardContent={totalNewUsers.toFixed()} />
		<NumberCard
			cardTitle="Lifetime Interactions"
			cardContent={data.lifetimeInteractions.toFixed()}
		/>
		<NumberCard
			cardTitle="Lifetime Unique Users"
			cardContent={data.lifetimeUniqueUsers.toFixed()}
		/>
		<NumberCard
			cardTitle="Total Number of Questions Asked"
			cardContent={totalQuestionsAsked.toFixed()}
		/>
		<NumberCard
			cardTitle="Number of Unique Messages Received"
			cardContent={data.uniqueContentCount.toFixed()}
		/>
		<NumberCard
			cardTitle="Number of Messages Received"
			cardContent={totalMessagesReceived.toFixed()}
		/>
		<NumberCard
			cardTitle="Total Number of Messages Sent"
			cardContent={totalMessagesSent.toFixed()}
		/>
	</dl>

	<div class="patient-history-container px-4">
		<div class="grid-layout gap-8">
			<div class="centered-flex gap-10">
				<div
					class="centered-flex w-full overflow-x-auto border border-[var(--color-outline)] shadow-lg sm:px-4"
				>
					<div class="w-full">
						<div class="centered-flex">
							<h4 class="users-head">Messages Received by Date</h4>
						</div>
						<div class="h-96 p-2">
							<BarChart
								labels={dailySeriesLabels}
								dataSource={dailySeriesMessagesReceived}
								title="Messages Received by Date"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-6">
			<h4 class="basic-stat mb-3">Message Content Received</h4>
			{#if hasChartData(topContentCounts)}
				<div class="h-96 border border-[var(--color-outline)] p-2 shadow-lg">
					<HorizontalBarChart
						labels={topContentLabels}
						dataSource={topContentCounts}
						title="Message Content Received"
					/>
				</div>
			{:else}
				<EmptyState />
			{/if}
		</div>
	</div>
{/if}
