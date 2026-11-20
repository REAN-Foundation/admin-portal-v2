<script lang="ts">
	import dayjs from 'dayjs';
	import NumberCard from '$lib/components/dashboard/number.card.svelte';
	import EmptyState from '$lib/components/analytics/EmptyState.svelte';
	import CustomChart from './custom-chart.svelte';
	import CustomUsersTable from './custom-users-table.svelte';
	import type {
		CustomStatsSummary,
		CustomStatsUsersPage,
		CustomUsersOrder,
		CustomUsersQuery,
		CustomUsersSortBy
	} from '$lib/types/custom.stats.types';

	//////////////////////////////////////////////////////////////////////////
	// Dashboard for tenants listed in CUSTOM_STATS_TENANTS (data from /stats/custom/*).

	let {
		summary,
		users,
		usersSortBy = 'interactions',
		usersOrder = 'desc',
		onUsersQuery
	}: {
		summary: CustomStatsSummary | null;
		users: CustomStatsUsersPage | null;
		usersSortBy?: CustomUsersSortBy;
		usersOrder?: CustomUsersOrder;
		onUsersQuery?: (query: CustomUsersQuery) => void;
	} = $props();

	// Platform Distribution card is disabled for now; change to true to show it again.
	const SHOW_PLATFORM_DISTRIBUTION = false;

	const fmt = (value: number | null | undefined) => Number(value ?? 0).toLocaleString('en-IN');
	const fmtDate = (value: string) => dayjs(value).format('DD MMM YYYY');

	// "end" from the API is exclusive; show the last included day.
	let periodLabel = $derived(
		summary?.range
			? `${fmtDate(summary.range.start)} – ${fmtDate(dayjs(summary.range.end).subtract(1, 'day').format('YYYY-MM-DD'))}`
			: ''
	);

	const labelsOf = <T,>(rows: T[] | undefined, key: keyof T) =>
		(rows ?? []).map((r) => String(r[key]));
	const countsOf = (rows: { count: number }[] | undefined) => (rows ?? []).map((r) => r.count);
</script>

{#if !summary}
	<div class="flex min-h-[40vh] items-center justify-center px-4">
		<EmptyState message="Custom statistics could not be loaded. Please try again later." />
	</div>
{:else}
	<p class="px-6 pt-3 text-sm text-[var(--color-info)]">Showing data for {periodLabel}</p>

	<dl class="dashboard-cards">
		<NumberCard
			cardTitle="Total Unique Users"
			cardContent={fmt(summary.totalUniqueUsers)}
			additional=""
			prefix=""
		/>
		<NumberCard
			cardTitle="Users Who Provided Info"
			cardContent={fmt(summary.usersWithInfo)}
			additional=""
			prefix=""
		/>
		<NumberCard
			cardTitle="Users With No Info"
			cardContent={fmt(summary.usersWithoutInfo)}
			additional=""
			prefix=""
		/>
		<NumberCard
			cardTitle="Number of Interactions"
			cardContent={fmt(summary.totalInteractions)}
			additional=""
			prefix=""
		/>
		<NumberCard
			cardTitle="Users With Info Who Asked a Question"
			cardContent={fmt(summary.usersWithInfoAndInteraction)}
			additional=""
			prefix=""
		/>
		<NumberCard
			cardTitle="Peak Registration Day"
			cardContent={summary.peakRegistrationDay ? fmt(summary.peakRegistrationDay.count) : '-'}
			additional={summary.peakRegistrationDay
				? `on ${fmtDate(summary.peakRegistrationDay.date)}`
				: ''}
			prefix=""
		/>
		<NumberCard
			cardTitle="Peak Interaction Day"
			cardContent={summary.peakInteractionDay ? fmt(summary.peakInteractionDay.count) : '-'}
			additional={summary.peakInteractionDay
				? `on ${fmtDate(summary.peakInteractionDay.date)}`
				: ''}
			prefix=""
		/>
	</dl>

	<div class="flex flex-col gap-6 px-4 pb-6 text-sm text-[var(--color-info)]">
		<CustomChart
			title="Interactions Over Time"
			type="line"
			labels={labelsOf(summary.interactionsTimeline, 'date')}
			datasets={[{ label: 'Interactions', data: countsOf(summary.interactionsTimeline) }]}
			xTitle="Date"
			yTitle="Interactions"
		/>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<CustomChart
				title="New vs Returning Users"
				type="doughnut"
				labels={['New', 'Returning']}
				datasets={[
					{
						label: 'Users',
						data: [
							summary.userClassification?.newUsers ?? 0,
							summary.userClassification?.returningUsers ?? 0
						]
					}
				]}
			/>
			<CustomChart
				title="Feedback"
				type="doughnut"
				labels={labelsOf(summary.feedback, 'type')}
				datasets={[{ label: 'Feedback', data: countsOf(summary.feedback) }]}
			/>

			<CustomChart
				title="Topics by Interactions"
				horizontal
				labels={labelsOf(summary.categoryByInteractions, 'category')}
				datasets={[{ label: 'Interactions', data: countsOf(summary.categoryByInteractions) }]}
			/>
			<CustomChart
				title="Topics by Users"
				description="A user is counted once in each topic they asked about."
				horizontal
				labels={labelsOf(summary.categoryByUsers, 'category')}
				datasets={[{ label: 'Users', data: countsOf(summary.categoryByUsers) }]}
			/>

			<CustomChart
				title="Gender Distribution"
				type="pie"
				labels={labelsOf(summary.genderDistribution, 'gender')}
				datasets={[{ label: 'Users', data: countsOf(summary.genderDistribution) }]}
			/>
			<CustomChart
				title="Age Category"
				labels={labelsOf(summary.ageCategory, 'ageGroup')}
				datasets={[{ label: 'Users', data: countsOf(summary.ageCategory) }]}
				xTitle="Age group"
				yTitle="Users"
			/>

			<CustomChart
				title="Sensitivity by Interactions"
				description="Rated bot answers by sensitivity level."
				horizontal
				labels={labelsOf(summary.sensitivityByInteractions, 'sensitivity')}
				datasets={[{ label: 'Answers', data: countsOf(summary.sensitivityByInteractions) }]}
			/>
			<CustomChart
				title="Sensitivity by Users"
				description="A user is counted once in each level they received."
				horizontal
				labels={labelsOf(summary.sensitivityByUsers, 'sensitivity')}
				datasets={[{ label: 'Users', data: countsOf(summary.sensitivityByUsers) }]}
			/>
		</div>

		<CustomChart
			title="Interactions by Hour of Day"
			description="Hours in Indian Standard Time (IST)."
			labels={(summary.interactionsByHour ?? []).map(
				(h) => `${String(h.hour).padStart(2, '0')}:00`
			)}
			datasets={[{ label: 'Interactions', data: countsOf(summary.interactionsByHour) }]}
			xTitle="Hour (IST)"
			yTitle="Interactions"
		/>

		<!-- Platform Distribution card: hidden for now. Set SHOW_PLATFORM_DISTRIBUTION = true to show it again. -->
		{#if SHOW_PLATFORM_DISTRIBUTION}
			<div class="rounded-lg border border-[var(--color-outline)] p-4 shadow-lg">
				<h4 class="basic-stat mb-3">Platform Distribution</h4>
				{#if (summary.platformDistribution ?? []).length === 0}
					<EmptyState />
				{:else}
					<div class="table-container">
						<table class="table-c">
							<thead>
								<tr>
									<th>Platform</th>
									<th>Users</th>
									<th>Interactions</th>
								</tr>
							</thead>
							<tbody>
								{#each summary.platformDistribution as row (row.platform)}
									<tr>
										<td>{row.platform}</td>
										<td>{fmt(row.users)}</td>
										<td>{fmt(row.interactions)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}

		<CustomUsersTable {users} sortBy={usersSortBy} order={usersOrder} onQuery={onUsersQuery} />
	</div>
{/if}
